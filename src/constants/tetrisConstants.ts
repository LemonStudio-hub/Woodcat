/**
 * 俄罗斯方块常量定义
 * 定义俄罗斯方块游戏中使用的常量值
 */

/**
 * 棋盘宽度
 */
export const BOARD_WIDTH = 10;

/**
 * 棋盘高度
 */
export const BOARD_HEIGHT = 20;

/**
 * 方块类型
 */
export enum BlockType {
  EMPTY = 0,
  I = 1,
  O = 2,
  T = 3,
  S = 4,
  Z = 5,
  J = 6,
  L = 7,
}

/**
 * 游戏状态
 */
export enum GameState {
  PLAYING = 'playing',
  GAME_OVER = 'gameOver',
}

/**
 * 方块形状定义
 * 每个方块由多个坐标组成
 */
export const BLOCK_SHAPES: Record<BlockType, number[][]> = {
  [BlockType.I]: [
    [1, 1, 1, 1],
  ],
  [BlockType.O]: [
    [1, 1],
    [1, 1],
  ],
  [BlockType.T]: [
    [0, 1, 0],
    [1, 1, 1],
  ],
  [BlockType.S]: [
    [0, 1, 1],
    [1, 1, 0],
  ],
  [BlockType.Z]: [
    [1, 1, 0],
    [0, 1, 1],
  ],
  [BlockType.J]: [
    [1, 0, 0],
    [1, 1, 1],
  ],
  [BlockType.L]: [
    [0, 0, 1],
    [1, 1, 1],
  ],
  [BlockType.EMPTY]: [],
};

/**
 * 方块颜色映射
 * 使用黑白灰配色，区分不同的方块类型
 */
export const BLOCK_COLORS: Record<BlockType, string> = {
  [BlockType.EMPTY]: '#ffffff',
  [BlockType.I]: '#000000',      // 黑色
  [BlockType.O]: '#1a1a1a',      // 极深灰
  [BlockType.T]: '#333333',      // 深灰
  [BlockType.S]: '#4d4d4d',      // 中灰
  [BlockType.Z]: '#666666',      // 中浅灰
  [BlockType.J]: '#808080',      // 浅灰
  [BlockType.L]: '#999999',      // 极浅灰
};

/**
 * 方块名称映射
 */
export const BLOCK_NAMES: Record<BlockType, string> = {
  [BlockType.EMPTY]: '空',
  [BlockType.I]: 'I型',
  [BlockType.O]: 'O型',
  [BlockType.T]: 'T型',
  [BlockType.S]: 'S型',
  [BlockType.Z]: 'Z型',
  [BlockType.J]: 'J型',
  [BlockType.L]: 'L型',
};

/**
 * 方块类型列表（用于随机生成）
 */
export const BLOCK_TYPES: BlockType[] = [
  BlockType.I,
  BlockType.O,
  BlockType.T,
  BlockType.S,
  BlockType.Z,
  BlockType.J,
  BlockType.L,
];

/**
 * 下落速度（毫秒）
 */
export const DROP_SPEED = 1000;