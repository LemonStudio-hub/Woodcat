/**
 * 五子棋游戏常量定义
 * 定义游戏中使用的常量值
 */

/**
 * 棋盘大小（格数）
 */
export const BOARD_SIZE = 15;

/**
 * 玩家类型枚举
 */
export enum Player {
  EMPTY = 0,
  BLACK = 1,
  WHITE = 2,
}

/**
 * 游戏状态枚举
 */
export enum GameState {
  PLAYING = 'playing',
  BLACK_WINS = 'black_wins',
  WHITE_WINS = 'white_wins',
  DRAW = 'draw',
}

/**
 * 游戏模式枚举
 */
export enum GameMode {
  PVP = 'pvp', // 双人对战
  PVE = 'pve', // 人机对战
}