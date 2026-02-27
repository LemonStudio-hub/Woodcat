/**
 * 扫雷游戏常量定义
 * 定义游戏中使用的常量值
 */

/**
 * 棋盘大小配置
 */
export const BOARD_CONFIG = {
  EASY: { rows: 9, cols: 9, mines: 10 },
  MEDIUM: { rows: 16, cols: 16, mines: 40 },
  HARD: { rows: 16, cols: 30, mines: 99 },
} as const;

/**
 * 难度级别枚举
 */
export enum Difficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

/**
 * 格子状态枚举
 */
export enum CellState {
  HIDDEN = 'hidden',
  REVEALED = 'revealed',
  FLAGGED = 'flagged',
}

/**
 * 游戏状态枚举
 */
export enum GameState {
  PLAYING = 'playing',
  WON = 'won',
  LOST = 'lost',
}

/**
 * 难度配置映射
 */
export const DIFFICULTY_CONFIG = {
  [Difficulty.EASY]: BOARD_CONFIG.EASY,
  [Difficulty.MEDIUM]: BOARD_CONFIG.MEDIUM,
  [Difficulty.HARD]: BOARD_CONFIG.HARD,
} as const;

/**
 * 难度名称映射
 */
export const DIFFICULTY_NAMES = {
  [Difficulty.EASY]: '简单',
  [Difficulty.MEDIUM]: '中等',
  [Difficulty.HARD]: '困难',
} as const;

/**
 * 扫雷坐标
 */
export interface Coord {
  row: number;
  col: number;
}

/**
 * 扫雷格子类型
 */
export interface Cell {
  row: number;
  col: number;
  isMine: boolean;
  adjacentMines: number;
  state: CellState;
}

/**
 * 有效移动
 */
export interface ValidMove {
  coord: Coord;
}

/**
 * 扫雷统计数据
 */
export interface MinesweeperStats {
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  bestTimes: {
    easy: number | null;
    medium: number | null;
    hard: number | null;
  };
}

/**
 * 游戏记录
 */
export interface MinesweeperGameRecord {
  difficulty: Difficulty;
  result: GameState;
  time: number;
  timestamp: number;
}