/**
 * 2048 游戏逻辑组合式函数
 * 封装 2048 游戏核心逻辑
 */

import { ref, computed } from 'vue';
import { Direction, BOARD_SIZE, INITIAL_TILES, NEW_TILE_4_PROBABILITY } from '@/constants/2048Constants';

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

  /**
   * 游戏分数
   */
  const score = ref<number>(0);

  /**
   * 最高分数
   */
  const bestScore = ref<number>(0);

  /**
   * 游戏是否结束
   */
  const gameOver = ref<boolean>(false);

  /**
   * 游戏是否获胜
   */
  const gameWon = ref<boolean>(false);

  /**
   * 下一个方块 ID
   */
  let nextTileId = 0;

  // ========== 计算属性 ==========

  /**
   * 游戏状态文本
   */
  const statusText = computed(() => {
    if (gameWon.value) return '你赢了！';
    if (gameOver.value) return '游戏结束';
    return '游戏中';
  });

  // ========== 核心逻辑 ==========

  /**
   * 初始化游戏
   */
  function initGame(): void {
    tiles.value = [];
    score.value = 0;
    gameOver.value = false;
    gameWon.value = false;
    nextTileId = 0;

    // 添加初始方块
    for (let i = 0; i < INITIAL_TILES; i++) {
      addRandomTile();
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
    if (gameOver.value || gameWon.value) return false;

    // 清除合并标记
    tiles.value.forEach((tile) => {
      tile.isMerged = false;
      tile.isNew = false;
      delete tile.mergedFrom;
    });

    let moved = false;
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
            score.value += mergedTile.value;

            // 检查是否获胜
            if (mergedTile.value === 2048) {
              gameWon.value = true;
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
      addRandomTile();
      updateBestScore();

      // 检查游戏是否结束
      if (!movesAvailable()) {
        gameOver.value = true;
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
   * 更新最高分数
   */
  function updateBestScore(): void {
    if (score.value > bestScore.value) {
      bestScore.value = score.value;
    }
  }

  /**
   * 重新开始游戏
   */
  function restartGame(): void {
    initGame();
  }

  return {
    // 状态
    tiles,
    score,
    bestScore,
    gameOver,
    gameWon,
    statusText,
    // 方法
    initGame,
    move,
    restartGame,
  };
}