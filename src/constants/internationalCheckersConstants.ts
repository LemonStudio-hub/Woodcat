/**
 * 国际跳棋游戏常量定义
 * 定义游戏中使用的常量值
 */

/**
 * 棋盘大小
 */
export const BOARD_SIZE = 8;

/**
 * 棋子数量（每个玩家）
 */
export const PIECES_PER_PLAYER = 12;

/**
 * 玩家类型枚举
 */
export enum Player {
  EMPTY = 0,
  RED = 1,      // 红色（下方，向上移动）
  BLACK = 2,    // 黑色（上方，向下移动）
}

/**
 * 棋子类型
 */
export enum PieceType {
  NORMAL = 'normal',  // 普通棋子
  KING = 'king',      // 王（到达对方底线后升级）
}

/**
 * 玩家颜色映射
 */
export const PLAYER_COLORS: Record<Player, string> = {
  [Player.EMPTY]: 'transparent',
  [Player.RED]: '#FFFFFF',
  [Player.BLACK]: '#000000',
};

/**
 * 玩家名称
 */
export const PLAYER_NAMES: Record<Player, string> = {
  [Player.EMPTY]: '空',
  [Player.RED]: '白色',
  [Player.BLACK]: '黑色',
};

/**
 * 游戏状态枚举
 */
export enum GameState {
  PLAYING = 'playing',
  RED_WINS = 'red_wins',
  BLACK_WINS = 'black_wins',
  DRAW = 'draw',
}

/**
 * 游戏模式枚举
 */
export enum GameMode {
  PVP = 'pvp',      // 双人对战
  PVE = 'pve',      // 人机对战
}

/**
 * 移动类型
 */
export enum MoveType {
  STEP = 'step',    // 单步移动
  JUMP = 'jump',    // 跳跃吃子
}

/**
 * 跳棋坐标
 */
export interface Coord {
  row: number;
  col: number;
}

/**
 * 跳棋棋子类型
 */
export interface Piece {
  id: number;
  player: Player;
  position: Coord;
  type: PieceType;
}

/**
 * 有效移动
 */
export interface ValidMove {
  from: Coord;
  to: Coord;
  type: MoveType;
  captured?: Coord;  // 被吃掉的棋子位置
  promotion?: boolean;  // 是否升级为王
}

/**
 * 方向向量
 * 注意：row-1是向上，row+1是向下
 * col-1是向左，col+1是向右
 */
export const DIRECTIONS = {
  UP_LEFT: { row: -1, col: -1 },   // 向上向左
  UP_RIGHT: { row: -1, col: 1 },   // 向上向右
  DOWN_LEFT: { row: 1, col: -1 },  // 向下向左
  DOWN_RIGHT: { row: 1, col: 1 },  // 向下向右
} as const;

/**
 * AI 难度级别
 */
export enum AIDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}