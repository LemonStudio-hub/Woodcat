/**
 * 国际象棋游戏常量定义
 * 定义游戏中使用的常量值
 */

/**
 * 棋盘大小
 */
export const BOARD_SIZE = 8;

/**
 * 玩家类型枚举
 */
export enum Player {
  WHITE = 'white',
  BLACK = 'black',
}

/**
 * 棋子类型枚举
 */
export enum PieceType {
  KING = 'king',
  QUEEN = 'queen',
  ROOK = 'rook',
  BISHOP = 'bishop',
  KNIGHT = 'knight',
  PAWN = 'pawn',
}

/**
 * 棋子Unicode符号
 */
export const PIECE_SYMBOLS: Record<Player, Record<PieceType, string>> = {
  [Player.WHITE]: {
    [PieceType.KING]: '♔',
    [PieceType.QUEEN]: '♕',
    [PieceType.ROOK]: '♖',
    [PieceType.BISHOP]: '♗',
    [PieceType.KNIGHT]: '♘',
    [PieceType.PAWN]: '♙',
  },
  [Player.BLACK]: {
    [PieceType.KING]: '♚',
    [PieceType.QUEEN]: '♛',
    [PieceType.ROOK]: '♜',
    [PieceType.BISHOP]: '♝',
    [PieceType.KNIGHT]: '♞',
    [PieceType.PAWN]: '♟',
  },
};

/**
 * 玩家名称
 */
export const PLAYER_NAMES: Record<Player, string> = {
  [Player.WHITE]: '白方',
  [Player.BLACK]: '黑方',
};

/**
 * 棋子名称
 */
export const PIECE_NAMES: Record<PieceType, string> = {
  [PieceType.KING]: '王',
  [PieceType.QUEEN]: '后',
  [PieceType.ROOK]: '车',
  [PieceType.BISHOP]: '象',
  [PieceType.KNIGHT]: '马',
  [PieceType.PAWN]: '兵',
};

/**
 * 游戏状态枚举
 */
export enum GameState {
  PLAYING = 'playing',
  WHITE_WINS = 'white_wins',
  BLACK_WINS = 'black_wins',
  DRAW = 'draw',
  CHECKMATE = 'checkmate',
  STALEMATE = 'stalemate',
}

/**
 * 游戏模式枚举
 */
export enum GameMode {
  PVP = 'pvp',
  PVE = 'pve',
}

/**
 * 特殊移动类型
 */
export enum SpecialMove {
  CASTLING_KINGSIDE = 'castling_kingside',
  CASTLING_QUEENSIDE = 'castling_queenside',
  EN_PASSANT = 'en_passant',
  PROMOTION = 'promotion',
}

/**
 * 象棋坐标
 */
export interface Coord {
  row: number;
  col: number;
}

/**
 * 象棋棋子类型
 */
export interface Piece {
  id: number;
  type: PieceType;
  player: Player;
  position: Coord;
  hasMoved?: boolean;  // 是否移动过（用于王车易位）
}

/**
 * 有效移动
 */
export interface ValidMove {
  from: Coord;
  to: Coord;
  pieceType: PieceType;
  captured?: Piece;  // 被吃掉的棋子
  specialMove?: SpecialMove;  // 特殊移动
  promotionPiece?: PieceType;  // 升变的棋子类型
}

/**
 * AI 难度级别
 */
export enum AIDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}