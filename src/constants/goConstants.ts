/**
 * 围棋游戏常量定义
 * 定义游戏中使用的常量值
 */

/**
 * 棋盘大小
 */
export const BOARD_SIZE = 19;

/**
 * 玩家类型枚举
 */
export enum Player {
  EMPTY = 0,
  BLACK = 1,   // 黑方（先手）
  WHITE = 2,   // 白方（后手）
}

/**
 * 玩家颜色映射
 */
export const PLAYER_COLORS: Record<Player, string> = {
  [Player.EMPTY]: 'transparent',
  [Player.BLACK]: '#000000',
  [Player.WHITE]: '#ffffff',
};

/**
 * 玩家名称
 */
export const PLAYER_NAMES: Record<Player, string> = {
  [Player.EMPTY]: '空',
  [Player.BLACK]: '黑方',
  [Player.WHITE]: '白方',
};

/**
 * 游戏状态枚举
 */
export enum GameState {
  PLAYING = 'playing',
  BLACK_WINS = 'black_wins',
  WHITE_WINS = 'white_wins',
  RESIGN = 'resign',
}

/**
 * 棋子坐标
 */
export interface Coord {
  row: number;
  col: number;
}

/**
 * 棋子类型
 */
export interface Stone {
  id: number;
  player: Player;
  position: Coord;
}

/**
 * 气信息
 */
export interface Liberty {
  coord: Coord;
  liberties: number;
}

/**
 * 历史记录
 */
export interface HistoryMove {
  player: Player;
  from: Coord | null;   // null 表示新下子，否则是提子
  to: Coord;
  captured: Coord[];    // 被提掉的棋子
  ko: boolean;          // 是否是打劫
}