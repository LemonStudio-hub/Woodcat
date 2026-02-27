/**
 * 2048 游戏逻辑组合式函数
 * 封装 2048 游戏核心逻辑
 */

import { ref, computed } from 'vue';
import { Direction, BOARD_SIZE, INITIAL_TILES, NEW_TILE_4_PROBABILITY } from '@/constants/2048Constants';
import { persistenceService } from '@/services/persistenceService';
import { audioService, SoundType } from '@/services/audioService';
import { vibrationService, VibrationType } from '@/services/vibrationService';
import { useGame2048Store } from '@/stores/game2048Store';

/**
 * 方块类型
 */
export interface Tile {
  id: number;
  value: number;
  row: number;
  col: number;
  mergedFrom?: Tile[];
  isNew?: boolean;
  isMerged?: boolean;
}

/**
 * 2048 游戏逻辑
 */
export function use2048Game() {
  // ========== 状态 ==========

  /**
   * 棋盘上的方块
   */
  const tiles = ref<Tile[]>([]);

  // ========== Store ==========

  const game2048Store = useGame2048Store();

  /**
   * 加载游戏状态
   */
  function loadGameState(): void {
    const data = persistenceService.loadGame2048();

    // 如果有游戏状态，恢复游戏
    if (data.gameState && data.gameState.tiles && data.gameState.tiles.length > 0) {
      tiles.value = data.gameState.tiles.map(tile => ({
        ...tile,
        mergedFrom: undefined,
        isNew: false,
        isMerged: false,
      }));
      game2048Store.setGameOver(data.gameState.gameOver);
      game2048Store.setGameWon(data.gameState.gameWon);
      nextTileId = Math.max(...tiles.value.map(t => t.id), 0) + 1;
    } else {
      // 初始化新游戏
      initGame();
    }
  }

  /**
   * 清除游戏状态
   */
  function clearGameState(): void {
    persistenceService.saveGame2048({
      stats: {
        score: game2048Store.score,
        bestScore: game2048Store.bestScore,
      },
      gameState: null,
    });
  }

  /**
   * 下一个方块 ID
   */
  let nextTileId = 0;

  // 初始化时加载数据
  loadGameState();

  // ========== 计算属性 ==========

  /**
   * 游戏状态文本
   */
  const statusText = computed(() => {
    if (game2048Store.gameWon) return '你赢了！';
    if (game2048Store.gameOver) return '游戏结束';
    return '游戏中';
  });

  // ========== 核心逻辑 ==========

  /**
   * 初始化游戏
   */
  function initGame(): void {
    tiles.value = [];
    game2048Store.resetGame();
    nextTileId = 0;

    // 添加初始方块
    let attempts = 0;
    while (tiles.value.length < INITIAL_TILES && attempts < 100) {
      addRandomTile();
      attempts++;
    }

    // 如果仍然没有足够的方块，强制添加
    if (tiles.value.length === 0) {
      tiles.value = [
        {
          id: nextTileId++,
          value: 2,
          row: 0,
          col: 0,
          isNew: true,
        },
        {
          id: nextTileId++,
          value: 2,
          row: 0,
          col: 1,
          isNew: true,
        },
      ];
    }
  }

  /**
   * 在随机空位置添加一个新方块
   */
  function addRandomTile(): void {
    const emptyCells = getEmptyCells();
    if (emptyCells.length === 0) return;

    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const value = Math.random() < NEW_TILE_4_PROBABILITY ? 4 : 2;

    const newTile: Tile = {
      id: nextTileId++,
      value,
      row: randomCell.row,
      col: randomCell.col,
      isNew: true,
    };

    tiles.value.push(newTile);
  }

  /**
   * 获取空单元格
   */
  function getEmptyCells(): Array<{ row: number; col: number }> {
    const emptyCells: Array<{ row: number; col: number }> = [];

    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (!getTileAt(row, col)) {
          emptyCells.push({ row, col });
        }
      }
    }

    return emptyCells;
  }

  /**
   * 获取指定位置的方块
   */
  function getTileAt(row: number, col: number): Tile | undefined {
    return tiles.value.find((tile) => tile.row === row && tile.col === col);
  }

  /**
   * 移动方块
   */
  function move(direction: Direction): boolean {
    if (game2048Store.gameOver || game2048Store.gameWon) return false;

    // 清除合并标记
    tiles.value.forEach((tile) => {
      tile.isMerged = false;
      tile.isNew = false;
      delete tile.mergedFrom;
    });

    let moved = false;
    let merged = false;
    const vector = getVector(direction);
    const traversals = buildTraversals(vector);

    traversals.forEach((row) => {
      traversals.forEach((col) => {
        const tile = getTileAt(row, col);
        if (tile) {
          const positions = findFarthestPosition(row, col, vector);
          const next = getTileAt(positions.next.row, positions.next.col);

          if (next && next.value === tile.value && !next.isMerged) {
            // 合并方块
            const mergedTile: Tile = {
              id: nextTileId++,
              value: tile.value * 2,
              row: positions.next.row,
              col: positions.next.col,
              mergedFrom: [tile, next],
              isMerged: true,
            };

            tiles.value = tiles.value.filter((t) => t.id !== tile.id && t.id !== next.id);
            tiles.value.push(mergedTile);
            game2048Store.updateScore(game2048Store.score + mergedTile.value);
            merged = true;

            // 检查是否获胜
            if (mergedTile.value === 2048) {
              game2048Store.setGameWon(true);
            }

            moved = true;
          } else {
            // 移动方块
            if (tile.row !== positions.farthest.row || tile.col !== positions.farthest.col) {
              tile.row = positions.farthest.row;
              tile.col = positions.farthest.col;
              moved = true;
            }
          }
        }
      });
    });

    if (moved) {
      // 播放生成音效和震动
      audioService.play(SoundType.SCORE);
      vibrationService.vibrate(VibrationType.SCORE);
      
      // 添加新方块
      addRandomTile();

      // 播放音效和震动
      if (merged) {
        audioService.play(SoundType.MERGE);
        // 合并时使用更强的震动
        vibrationService.vibrateCustom([0, 50, 30, 50]);
        if (game2048Store.gameWon) {
          audioService.play(SoundType.WIN);
          // 胜利时使用欢快震动
          vibrationService.vibrateCustom([0, 100, 50, 100, 50, 200, 50, 100]);
        }
      } else {
        audioService.play(SoundType.MOVE);
        vibrationService.vibrate(VibrationType.MOVE);
      }

      // 检查游戏是否结束
      if (!movesAvailable()) {
        game2048Store.setGameOver(true);
        audioService.play(SoundType.LOSE);
        // 失败时使用连续震动
        vibrationService.vibrateCustom([0, 100, 50, 100, 50, 100]);
      }
    }

    return moved;
  }

  /**
   * 获取方向向量
   */
  function getVector(direction: Direction): { row: number; col: number } {
    const map: Record<Direction, { row: number; col: number }> = {
      [Direction.UP]: { row: -1, col: 0 },
      [Direction.DOWN]: { row: 1, col: 0 },
      [Direction.LEFT]: { row: 0, col: -1 },
      [Direction.RIGHT]: { row: 0, col: 1 },
    };
    return map[direction];
  }

  /**
   * 构建遍历顺序
   */
  function buildTraversals(vector: { row: number; col: number }): number[] {
    const traversals: number[] = [];

    for (let pos = 0; pos < BOARD_SIZE; pos++) {
      traversals.push(pos);
    }

    // 根据方向调整遍历顺序
    if (vector.row === 1) traversals.reverse();
    if (vector.col === 1) traversals.reverse();

    return traversals;
  }

  /**
   * 查找最远可移动位置
   */
  function findFarthestPosition(
    row: number,
    col: number,
    vector: { row: number; col: number },
  ): { farthest: { row: number; col: number }; next: { row: number; col: number } } {
    let previous;

    do {
      previous = { row, col };
      row += vector.row;
      col += vector.col;
    } while (
      row >= 0 &&
      row < BOARD_SIZE &&
      col >= 0 &&
      col < BOARD_SIZE &&
      !getTileAt(row, col)
    );

    return {
      farthest: previous,
      next: { row, col },
    };
  }

  /**
   * 检查是否还有可移动的步骤
   */
  function movesAvailable(): boolean {
    // 检查是否有空单元格
    if (getEmptyCells().length > 0) return true;

    // 检查是否有可以合并的相邻方块
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const tile = getTileAt(row, col);
        if (tile) {
          // 检查右侧
          if (col < BOARD_SIZE - 1) {
            const rightTile = getTileAt(row, col + 1);
            if (rightTile && rightTile.value === tile.value) return true;
          }
          // 检查下方
          if (row < BOARD_SIZE - 1) {
            const downTile = getTileAt(row + 1, col);
            if (downTile && downTile.value === tile.value) return true;
          }
        }
      }
    }

    return false;
  }

  /**
   * 重新开始游戏
   */
  function restartGame(): void {
    initGame();
    clearGameState();
  }

  return {
    // 状态
    tiles,
    score: computed(() => game2048Store.score),
    bestScore: computed(() => game2048Store.bestScore),
    gameOver: computed(() => game2048Store.gameOver),
    gameWon: computed(() => game2048Store.gameWon),
    statusText,
    // 方法
    initGame,
    move,
    restartGame,
    loadGameState,
    clearGameState,
  };
}