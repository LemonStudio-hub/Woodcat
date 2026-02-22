/**
 * 井字棋常量
 */

/**
 * 棋子类型
 */
export enum Cell {
  EMPTY = '',
  X = 'X',
  O = 'O',
}

/**
 * 游戏状态
 */
export enum GameState {
  PLAYING = 'playing',
  X_WINS = 'x_wins',
  O_WINS = 'o_wins',
  DRAW = 'draw',
}

/**
 * 棋盘大小
 */
export const BOARD_SIZE = 3;

/**
 * 获胜组合
 */
export const WINNING_COMBINATIONS = [
  // 横向
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  // 纵向
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  // 斜向
  [0, 4, 8],
  [2, 4, 6],
];

/**
 * 游戏模式
 */
export enum GameMode {
  PVP = 'pvp',
  PVE = 'pve',
}