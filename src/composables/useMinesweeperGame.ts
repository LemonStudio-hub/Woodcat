/**
 * 扫雷游戏逻辑组合式函数
 * 封装游戏核心逻辑
 */

import { ref, computed } from 'vue';
import {
  Difficulty,
  CellState,
  GameState,
  Coord,
  Cell,
  DIFFICULTY_CONFIG,
  DIFFICULTY_NAMES,
  type MinesweeperStats,
} from '@/constants/minesweeperConstants';
import { persistenceService } from '@/services/persistenceService';
import { audioService, SoundType } from '@/services/audioService';
import { vibrationService, VibrationType } from '@/services/vibrationService';

/**
 * 扫雷游戏逻辑
 */
export function useMinesweeperGame() {
  // ========== 状态 ==========

  /**
   * 棋盘格子
   */
  const cells = ref<Cell[][]>([]);

  /**
   * 游戏难度
   */
  const difficulty = ref<Difficulty>(Difficulty.EASY);

  /**
   * 游戏状态
   */
  const gameState = ref<GameState>(GameState.PLAYING);

  /**
   * 游戏计时器
   */
  const gameTime = ref<number>(0);

  /**
   * 剩余地雷数量
   */
  const remainingMines = ref<number>(0);

  /**
   * 是否第一次点击
   */
  const isFirstClick = ref<boolean>(true);

  /**
   * 计时器ID
   */
  let timerId: number | null = null;

  /**
   * 游戏开始时间
   */
  let gameStartTime: number = 0;

  // ========== 统计数据 ==========

  /**
   * 游戏统计
   */
  const stats = ref<MinesweeperStats>({
    gamesPlayed: 0,
    gamesWon: 0,
    gamesLost: 0,
    bestTimes: {
      easy: null,
      medium: null,
      hard: null,
    },
  });

  // ========== 计算属性 ==========

  /**
   * 当前配置
   */
  const currentConfig = computed(() => DIFFICULTY_CONFIG[difficulty.value]);

  /**
   * 行数
   */
  const rows = computed(() => currentConfig.value.rows);

  /**
   * 列数
   */
  const cols = computed(() => currentConfig.value.cols);

  /**
   * 地雷总数
   */
  const totalMines = computed(() => currentConfig.value.mines);

  /**
   * 游戏状态文本
   */
  const statusText = computed((): string => {
    if (gameState.value === GameState.WON) return '恭喜获胜！';
    if (gameState.value === GameState.LOST) return '游戏结束！';
    return DIFFICULTY_NAMES[difficulty.value];
  });

  // ========== 辅助函数 ==========

  /**
   * 判断坐标是否有效
   */
  function isValidCoord(coord: Coord): boolean {
    return coord.row >= 0 && coord.row < rows.value && coord.col >= 0 && coord.col < cols.value;
  }

  /**
   * 获取相邻坐标
   */
  function getAdjacentCoords(coord: Coord): Coord[] {
    const adjacents: Coord[] = [];
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const adjacent: Coord = { row: coord.row + dr, col: coord.col + dc };
        if (isValidCoord(adjacent)) {
          adjacents.push(adjacent);
        }
      }
    }
    return adjacents;
  }

  /**
   * 比较两个坐标是否相等
   */
  function coordEqual(a: Coord, b: Coord): boolean {
    return a.row === b.row && a.col === b.col;
  }

  // ========== 游戏初始化 ==========

  /**
   * 初始化棋盘
   */
  function initBoard(): void {
    cells.value = [];
    for (let r = 0; r < rows.value; r++) {
      const row: Cell[] = [];
      for (let c = 0; c < cols.value; c++) {
        row.push({
          row: r,
          col: c,
          isMine: false,
          adjacentMines: 0,
          state: CellState.HIDDEN,
        });
      }
      cells.value.push(row);
    }
    remainingMines.value = totalMines.value;
    isFirstClick.value = true;
    gameState.value = GameState.PLAYING;
    stopTimer();
    gameTime.value = 0;
  }

  /**
   * 放置地雷
   */
  function placeMines(excludeCoord: Coord): void {
    let minesPlaced = 0;
    while (minesPlaced < totalMines.value) {
      const r = Math.floor(Math.random() * rows.value);
      const c = Math.floor(Math.random() * cols.value);
      const coord: Coord = { row: r, col: c };

      // 不在第一次点击的位置放置地雷
      if (coordEqual(coord, excludeCoord)) continue;
      // 不在已有地雷的位置放置
      if (cells.value[r][c].isMine) continue;

      cells.value[r][c].isMine = true;
      minesPlaced++;
    }

    // 计算每个格子周围的地雷数量
    for (let r = 0; r < rows.value; r++) {
      for (let c = 0; c < cols.value; c++) {
        if (cells.value[r][c].isMine) continue;
        const adjacents = getAdjacentCoords({ row: r, col: c });
        cells.value[r][c].adjacentMines = adjacents.filter(
          (adj) => cells.value[adj.row][adj.col].isMine
        ).length;
      }
    }
  }

  // ========== 游戏逻辑 ==========

  /**
   * 揭开格子
   */
  function revealCell(coord: Coord): void {
    if (!isValidCoord(coord)) return;
    const cell = cells.value[coord.row][coord.col];
    if (cell.state !== CellState.HIDDEN) return;

    // 第一次点击时放置地雷
    if (isFirstClick.value) {
      placeMines(coord);
      isFirstClick.value = false;
      startTimer();
    }

    cell.state = CellState.REVEALED;

    // 踩到地雷
    if (cell.isMine) {
      gameOver(false);
      return;
    }

    audioService.play(SoundType.MOVE);
    vibrationService.vibrateCustom([10]);

    // 如果是空格，递归揭开相邻格子
    if (cell.adjacentMines === 0) {
      const adjacents = getAdjacentCoords(coord);
      adjacents.forEach((adj) => revealCell(adj));
    }

    // 检查是否获胜
    checkWin();
  }

  /**
   * 标记/取消标记格子
   */
  function toggleFlag(coord: Coord): void {
    if (!isValidCoord(coord)) return;
    const cell = cells.value[coord.row][coord.col];

    if (cell.state === CellState.HIDDEN) {
      cell.state = CellState.FLAGGED;
      remainingMines.value--;
      audioService.play(SoundType.MOVE);
    } else if (cell.state === CellState.FLAGGED) {
      cell.state = CellState.HIDDEN;
      remainingMines.value++;
    }
  }

  /**
   * 检查是否获胜
   */
  function checkWin(): void {
    let hiddenNonMineCount = 0;
    for (let r = 0; r < rows.value; r++) {
      for (let c = 0; c < cols.value; c++) {
        const cell = cells.value[r][c];
        if (!cell.isMine && cell.state === CellState.HIDDEN) {
          hiddenNonMineCount++;
        }
      }
    }

    if (hiddenNonMineCount === 0) {
      gameOver(true);
    }
  }

  /**
   * 游戏结束
   */
  function gameOver(won: boolean): void {
    stopTimer();
    gameState.value = won ? GameState.WON : GameState.LOST;

    stats.value.gamesPlayed++;
    if (won) {
      stats.value.gamesWon++;
      updateBestTime();
      audioService.play(SoundType.WIN);
      vibrationService.vibrate(VibrationType.WIN);
    } else {
      stats.value.gamesLost++;
      audioService.play(SoundType.MERGE);
      vibrationService.vibrate(VibrationType.MERGE);
      revealAllMines();
    }
  }

  /**
   * 揭开所有地雷
   */
  function revealAllMines(): void {
    for (let r = 0; r < rows.value; r++) {
      for (let c = 0; c < cols.value; c++) {
        const cell = cells.value[r][c];
        if (cell.isMine && cell.state === CellState.HIDDEN) {
          cell.state = CellState.REVEALED;
        }
      }
    }
  }

  // ========== 计时器 ==========

  /**
   * 启动计时器
   */
  function startTimer(): void {
    gameStartTime = Date.now();
    timerId = window.setInterval(() => {
      gameTime.value = Math.floor((Date.now() - gameStartTime) / 1000);
    }, 1000);
  }

  /**
   * 停止计时器
   */
  function stopTimer(): void {
    if (timerId !== null) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  /**
   * 更新最佳时间
   */
  function updateBestTime(): void {
    const currentBest = stats.value.bestTimes[difficulty.value];
    if (currentBest === null || gameTime.value < currentBest) {
      stats.value.bestTimes[difficulty.value] = gameTime.value;
    }
  }

  // ========== 持久化 ==========

  /**
   * 加载统计数据
   */
  function loadStats(): void {
    const data = persistenceService.loadMinesweeperGame();
    stats.value = data.stats;
  }

  /**
   * 保存统计数据
   */
  function saveStats(): void {
    persistenceService.saveMinesweeperGame({
      stats: stats.value,
      gameState: null,
    });
  }

  // ========== 游戏控制 ==========

  /**
   * 设置难度
   */
  function setDifficulty(newDifficulty: Difficulty): void {
    difficulty.value = newDifficulty;
    initBoard();
  }

  /**
   * 开始新游戏
   */
  function startNewGame(): void {
    initBoard();
  }

  /**
   * 重置所有统计数据
   */
  function resetAllStats(): void {
    stats.value = {
      gamesPlayed: 0,
      gamesWon: 0,
      gamesLost: 0,
      bestTimes: {
        easy: null,
        medium: null,
        hard: null,
      },
    };
    initBoard();
  }

  // 初始化游戏棋盘
  initBoard();

  return {
    // 状态
    cells,
    difficulty,
    gameState,
    gameTime,
    remainingMines,
    rows,
    cols,
    totalMines,
    stats,
    statusText,
    // 方法
    initBoard,
    revealCell,
    toggleFlag,
    setDifficulty,
    startNewGame,
    resetAllStats,
    loadStats,
    saveStats,
    // 辅助函数
    isValidCoord,
    coordEqual,
  };
}