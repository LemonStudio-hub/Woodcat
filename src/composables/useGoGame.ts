/**
 * 围棋游戏逻辑组合式函数
 * 封装游戏核心逻辑
 */

import { ref, computed } from 'vue';
import {
  BOARD_SIZE,
  Player,
  GameState,
  Coord,
  Stone,
  HistoryMove,
  PLAYER_NAMES,
} from '@/constants/goConstants';
import { persistenceService } from '@/services/persistenceService';
import { audioService, SoundType } from '@/services/audioService';
import { vibrationService, VibrationType } from '@/services/vibrationService';

/**
 * 围棋游戏逻辑
 */
export function useGoGame() {
  // ========== 状态 ==========

  /**
   * 棋盘状态（二维数组）
   */
  const board = ref<Player[][]>([]);

  /**
   * 当前玩家
   */
  const currentPlayer = ref<Player>(Player.BLACK);

  /**
   * 游戏状态
   */
  const gameState = ref<GameState>(GameState.PLAYING);

  /**
   * 黑方提子数
   */
  const blackCaptures = ref<number>(0);

  /**
   * 白方提子数
   */
  const whiteCaptures = ref<number>(0);

  /**
   * 历史记录
   */
  const history = ref<HistoryMove[]>([]);

  /**
   * 最后一个被提掉的棋子位置（用于打劫判断）
   */
  const lastCapture = ref<Coord | null>(null);

  /**
   * 动画状态
   */
  const animations = ref<Map<string, { type: string; timestamp: number }>>(new Map());

  /**
   * 最后落子位置
   */
  const lastMove = ref<Coord | null>(null);

  // ========== 辅助函数 ==========

  /**
   * 比较两个坐标是否相等
   */
  function coordEqual(a: Coord, b: Coord): boolean {
    return a.row === b.row && a.col === b.col;
  }

  /**
   * 检查坐标是否在棋盘内
   */
  function isValidCoord(coord: Coord): boolean {
    return coord.row >= 0 && coord.row < BOARD_SIZE && coord.col >= 0 && coord.col < BOARD_SIZE;
  }

  /**
   * 获取指定坐标的棋子
   */
  function getStoneAt(coord: Coord): Player {
    if (!isValidCoord(coord)) return Player.EMPTY;
    return board.value[coord.row][coord.col];
  }

  /**
   * 获取棋子周围四个方向的坐标
   */
  function getNeighbors(coord: Coord): Coord[] {
    const directions = [
      { row: -1, col: 0 },  // 上
      { row: 1, col: 0 },   // 下
      { row: 0, col: -1 },  // 左
      { row: 0, col: 1 },   // 右
    ];

    const neighbors: Coord[] = [];
    directions.forEach((dir) => {
      const neighbor: Coord = {
        row: coord.row + dir.row,
        col: coord.col + dir.col,
      };
      if (isValidCoord(neighbor)) {
        neighbors.push(neighbor);
      }
    });

    return neighbors;
  }

  /**
   * 获取一组棋子的气
   */
  function getLiberties(group: Coord[]): number {
    if (group.length === 0) return 0;

    const visited = new Set<string>();
    const liberties = new Set<string>();

    function dfs(coord: Coord) {
      const key = `${coord.row},${coord.col}`;
      if (visited.has(key)) return;
      visited.add(key);

      const neighbors = getNeighbors(coord);
      neighbors.forEach((neighbor) => {
        const stone = getStoneAt(neighbor);
        if (stone === Player.EMPTY) {
          liberties.add(`${neighbor.row},${neighbor.col}`);
        } else if (stone === getStoneAt(group[0])) {
          dfs(neighbor);
        }
      });
    }

    dfs(group[0]);
    return liberties.size;
  }

  /**
   * 获取一组相连的棋子
   */
  function getGroup(coord: Coord): Coord[] {
    const stone = getStoneAt(coord);
    if (stone === Player.EMPTY) return [];

    const group: Coord[] = [];
    const visited = new Set<string>();

    function dfs(c: Coord) {
      const key = `${c.row},${c.col}`;
      if (visited.has(key)) return;
      visited.add(key);

      if (getStoneAt(c) === stone) {
        group.push(c);
        const neighbors = getNeighbors(c);
        neighbors.forEach((neighbor) => dfs(neighbor));
      }
    }

    dfs(coord);
    return group;
  }

  /**
   * 检查是否是禁入点
   */
  function isForbidden(coord: Coord, player: Player): boolean {
    // 1. 检查该位置是否已有棋子
    if (getStoneAt(coord) !== Player.EMPTY) {
      return true;
    }

    // 2. 模拟下子
    board.value[coord.row][coord.col] = player;

    // 3. 检查是否有对方的棋子被提掉
    const opponent = player === Player.BLACK ? Player.WHITE : Player.BLACK;
    const neighbors = getNeighbors(coord);
    let capturedAny = false;

    neighbors.forEach((neighbor) => {
      if (getStoneAt(neighbor) === opponent) {
        const group = getGroup(neighbor);
        if (getLiberties(group) === 0) {
          capturedAny = true;
        }
      }
    });

    // 4. 检查自己的气
    const myGroup = getGroup(coord);
    const myLiberties = getLiberties(myGroup);

    // 5. 恢复棋盘
    board.value[coord.row][coord.col] = Player.EMPTY;

    // 6. 判断是否是禁入点
    // 如果没有提子，且自己没有气，则是禁入点
    if (!capturedAny && myLiberties === 0) {
      return true;
    }

    // 7. 检查打劫规则
    if (lastCapture.value && coordEqual(coord, lastCapture.value)) {
      // 如果这会导致提子，且提子数是1，则可能是打劫
      // 但需要更复杂的判断，这里简化处理
      // 如果是打劫，则不允许
      const opponentGroup = getGroup(coord);
      if (getLiberties(opponentGroup) === 0 && opponentGroup.length === 1) {
        return true;
      }
    }

    return false;
  }

  /**
   * 提子
   */
  function removeStones(stones: Coord[]): void {
    stones.forEach((stone) => {
      const player = board.value[stone.row][stone.col];
      board.value[stone.row][stone.col] = Player.EMPTY;

      if (player === Player.BLACK) {
        whiteCaptures.value++;
      } else {
        blackCaptures.value++;
      }
    });
  }

  // ========== 棋盘初始化 ==========

  /**
   * 初始化棋盘
   */
  function initBoard(): void {
    board.value = [];
    for (let row = 0; row < BOARD_SIZE; row++) {
      board.value[row] = [];
      for (let col = 0; col < BOARD_SIZE; col++) {
        board.value[row][col] = Player.EMPTY;
      }
    }
    currentPlayer.value = Player.BLACK;
    gameState.value = GameState.PLAYING;
    blackCaptures.value = 0;
    whiteCaptures.value = 0;
    history.value = [];
    lastCapture.value = null;
    animations.value.clear();
    lastMove.value = null;
  }

  // ========== 游戏控制 ==========

  /**
   * 下子
   */
  function placeStone(coord: Coord): boolean {
    if (gameState.value !== GameState.PLAYING) return false;
    if (!isValidCoord(coord)) return false;

    const player = currentPlayer.value;

    // 检查是否是禁入点
    if (isForbidden(coord, player)) {
      return false;
    }

    // 下子
    board.value[coord.row][coord.col] = player;

    // 添加下子动画
    const placeKey = `place-${coord.row}-${coord.col}`;
    animations.value.set(placeKey, {
      type: 'place',
      timestamp: Date.now(),
    });

    // 检查是否提子
    const opponent = player === Player.BLACK ? Player.WHITE : Player.BLACK;
    const neighbors = getNeighbors(coord);
    const captured: Coord[] = [];

    neighbors.forEach((neighbor) => {
      if (getStoneAt(neighbor) === opponent) {
        const group = getGroup(neighbor);
        if (getLiberties(group) === 0) {
          captured.push(...group);
        }
      }
    });

    // 移除被提掉的棋子
    removeStones(captured);

    // 添加提子动画
    captured.forEach((capturedCoord) => {
      const captureKey = `capture-${capturedCoord.row}-${capturedCoord.col}`;
      animations.value.set(captureKey, {
        type: 'capture',
        timestamp: Date.now(),
      });
    });

    // 记录打劫
    if (captured.length === 1) {
      lastCapture.value = captured[0];
    } else {
      lastCapture.value = null;
    }

    // 更新最后落子位置
    lastMove.value = coord;

    // 播放音效和震动
    if (captured.length > 0) {
      // 播放提子音效
      audioService.play(SoundType.MERGE);
      // 增强震动反馈
      vibrationService.vibrate(VibrationType.WIN);
      setTimeout(() => vibrationService.vibrate(VibrationType.MERGE), 100);
    } else {
      // 播放下子音效
      audioService.play(SoundType.PLACE_BLACK);
      // 播放下子震动
      vibrationService.vibrate(VibrationType.MOVE);
    }

    // 记录历史
    history.value.push({
      player,
      from: null,
      to: coord,
      captured,
      ko: captured.length === 1,
    });

    // 切换玩家
    currentPlayer.value = currentPlayer.value === Player.BLACK ? Player.WHITE : Player.BLACK;

    return true;
  }

  /**
   * 认输
   */
  function resign(): void {
    gameState.value = currentPlayer.value === Player.BLACK ? GameState.WHITE_WINS : GameState.BLACK_WINS;
    audioService.play(SoundType.WIN);
    vibrationService.vibrate(VibrationType.WIN);
  }

  /**
   * 开始新游戏
   */
  function startNewGame(): void {
    initBoard();
  }

  // ========== 计算属性 ==========

  /**
   * 游戏状态文本
   */
  const statusText = computed((): string => {
    if (gameState.value === GameState.BLACK_WINS) return '黑方获胜！';
    if (gameState.value === GameState.WHITE_WINS) return '白方获胜！';
    if (gameState.value === GameState.RESIGN) return '认输';

    const playerName = PLAYER_NAMES[currentPlayer.value];
    return `${playerName}回合`;
  });

  // ========== 持久化 ==========

  /**
   * 加载游戏状态
   */
  function loadGameState(): void {
    // 围棋游戏通常不持久化，因为棋局可能很长
    // 这里可以添加保存功能
  }

  // 初始化时初始化棋盘
  initBoard();

  return {
    // 状态
    board,
    currentPlayer,
    gameState,
    blackCaptures,
    whiteCaptures,
    history,
    animations,
    lastMove,
    statusText,
    // 方法
    placeStone,
    resign,
    startNewGame,
    initBoard,
    loadGameState,
    // 辅助函数
    getStoneAt,
    coordEqual,
  };
}