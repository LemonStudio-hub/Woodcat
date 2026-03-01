/**
 * 持久化服务
 * 使用 localStorage 存储和加载游戏数据
 */

import type { NotificationData } from '@/types/notification';

/**
 * 存储键前缀
 */
const STORAGE_PREFIX = 'woodcat_';

/**
 * 2048游戏统计数据接口
 */
export interface Game2048Stats {
  score: number;
  bestScore: number;
}

/**
 * 2048游戏完整数据接口
 */
export interface Game2048Data {
  stats: Game2048Stats;
  gameState: {
    tiles: Array<{ id: number; value: number; row: number; col: number }>;
    gameOver: boolean;
    gameWon: boolean;
  } | null;
}

/**
 * 贪吃蛇游戏统计数据接口
 */
export interface SnakeStats {
  score: number;
  bestScore: number;
}

/**
 * 贪吃蛇游戏完整数据接口
 */
export interface SnakeGameData {
  stats: SnakeStats;
  gameState: {
    snake: Array<{ x: number; y: number }>;
    food: { x: number; y: number };
    direction: string;
    gameOver: boolean;
  } | null;
}

/**
 * 五子棋游戏统计数据接口
 */
export interface GomokuStats {
  blackWins: number;
  whiteWins: number;
}

/**
 * 五子棋游戏完整数据接口
 */
export interface GomokuGameData {
  stats: GomokuStats;
  gameState: {
    board: Array<Array<number>>;
    currentPlayer: number;
    gameOver: boolean;
    winner: number | null;
  } | null;
}

/**
 * 井字棋游戏统计数据接口
 */
export interface TicTacToeStats {
  xWins: number;
  oWins: number;
  draws: number;
}

/**
 * 井字棋游戏完整数据接口
 */
export interface TicTacToeGameData {
  stats: TicTacToeStats;
  gameState: {
    board: Array<string>;
    currentPlayer: string;
    gameState: string;
  } | null;
}

/**
 * 俄罗斯方块游戏统计数据接口
 */
export interface TetrisStats {
  highScore: number;
}

/**
 * 俄罗斯方块游戏完整数据接口
 */
export interface TetrisGameData {
  stats: TetrisStats;
  gameState: {
    board: Array<Array<number>>;
    currentBlock: {
      type: number;
      x: number;
      y: number;
      shape: Array<Array<number>>;
    } | null;
    score: number;
    gameState: string;
  } | null;
}

/**
 * 国际跳棋游戏统计数据接口
 */
export interface InternationalCheckersStats {
  redWins: number;
  blackWins: number;
}

/**
 * 国际跳棋游戏完整数据接口
 */
export interface InternationalCheckersGameData {
  stats: InternationalCheckersStats;
  gameState: {
    pieces: Array<{ id: number; player: number; position: { row: number; col: number }; type: string }>;
    currentPlayer: number;
    gameMode: string;
    gameState: string;
  } | null;
}

/**
 * 国际象棋游戏统计数据接口
 */
export interface ChessStats {
  whiteWins: number;
  blackWins: number;
}

/**
 * 国际象棋游戏完整数据接口
 */
export interface ChessGameData {
  stats: ChessStats;
  gameState: {
    pieces: Array<{ id: number; type: string; player: string; position: { row: number; col: number }; hasMoved?: boolean }>;
    currentPlayer: string;
    gameMode: string;
    gameState: string;
  } | null;
}

/**
 * 扫雷游戏统计数据接口
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
 * 扫雷游戏完整数据接口
 */
export interface MinesweeperGameData {
  stats: MinesweeperStats;
  gameState: {
    difficulty: string;
    cells: Array<Array<{ isMine: boolean; adjacentMines: number; state: string }>>;
    gameState: string;
    remainingMines: number;
    gameTime: number;
  } | null;
}

/**
 * 持久化服务类
 */
class PersistenceService {
  /**
   * 保存数据到 localStorage
   */
  private save<T>(key: string, data: T): void {
    try {
      const storageKey = `${STORAGE_PREFIX}${key}`;
      const serialized = JSON.stringify(data);
      
      // 检查数据大小
      if (serialized.length > 5 * 1024 * 1024) { // 5MB
        console.warn(`Data too large for ${key}, skipping save`);
        return;
      }
      
      localStorage.setItem(storageKey, serialized);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.error('Storage quota exceeded, clearing old data');
        // 清除当前数据
        this.clear(key);
        // 尝试再次保存
        try {
          const storageKey = `${STORAGE_PREFIX}${key}`;
          const serialized = JSON.stringify(data);
          localStorage.setItem(storageKey, serialized);
        } catch (retryError) {
          console.error(`Failed to save data for ${key} after clearing:`, retryError);
        }
      } else {
        console.error(`Failed to save data for ${key}:`, error);
      }
    }
  }

  /**
   * 从 localStorage 加载数据
   */
  private load<T>(key: string, defaultValue: T): T {
    try {
      const storageKey = `${STORAGE_PREFIX}${key}`;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        return JSON.parse(stored) as T;
      }
    } catch (error) {
      console.error(`Failed to load data for ${key}:`, error);
    }
    return defaultValue;
  }

  /**
   * 清除指定数据
   */
  clear(key: string): void {
    try {
      const storageKey = `${STORAGE_PREFIX}${key}`;
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error(`Failed to clear data for ${key}:`, error);
    }
  }

  /**
   * 清除所有游戏数据
   */
  clearAll(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(STORAGE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Failed to clear all data:', error);
    }
  }

  // ========== 2048游戏 ==========

  /**
   * 保存2048游戏统计数据
   */
  saveGame2048Stats(stats: Game2048Stats): void {
    this.save('game2048_stats', stats);
  }

  /**
   * 加载2048游戏统计数据
   */
  loadGame2048Stats(): Game2048Stats {
    return this.load('game2048_stats', { score: 0, bestScore: 0 });
  }

  /**
   * 保存2048游戏完整数据（包括状态）
   */
  saveGame2048(data: Game2048Data): void {
    this.save('game2048', data);
  }

  /**
   * 加载2048游戏完整数据（包括状态）
   */
  loadGame2048(): Game2048Data {
    return this.load('game2048', { 
      stats: { score: 0, bestScore: 0 },
      gameState: null
    });
  }

  // ========== 贪吃蛇游戏 ==========

  /**
   * 保存贪吃蛇游戏统计数据
   */
  saveSnakeStats(stats: SnakeStats): void {
    this.save('snake_stats', stats);
  }

  /**
   * 加载贪吃蛇游戏统计数据
   */
  loadSnakeStats(): SnakeStats {
    return this.load('snake_stats', { score: 0, bestScore: 0 });
  }

  /**
   * 保存贪吃蛇游戏完整数据（包括状态）
   */
  saveSnakeGame(data: SnakeGameData): void {
    this.save('snake', data);
  }

  /**
   * 加载贪吃蛇游戏完整数据（包括状态）
   */
  loadSnakeGame(): SnakeGameData {
    return this.load('snake', { 
      stats: { score: 0, bestScore: 0 },
      gameState: null
    });
  }

  // ========== 五子棋游戏 ==========

  /**
   * 保存五子棋游戏统计数据
   */
  saveGomokuStats(stats: GomokuStats): void {
    this.save('gomoku_stats', stats);
  }

  /**
   * 加载五子棋游戏统计数据
   */
  loadGomokuStats(): GomokuStats {
    return this.load('gomoku_stats', { blackWins: 0, whiteWins: 0 });
  }

  /**
   * 保存五子棋游戏完整数据（包括状态）
   */
  saveGomokuGame(data: GomokuGameData): void {
    this.save('gomoku', data);
  }

  /**
   * 加载五子棋游戏完整数据（包括状态）
   */
  loadGomokuGame(): GomokuGameData {
    return this.load('gomoku', { 
      stats: { blackWins: 0, whiteWins: 0 },
      gameState: null
    });
  }

  // ========== 井字棋游戏 ==========

  /**
   * 保存井字棋游戏统计数据
   */
  saveTicTacToeStats(stats: TicTacToeStats): void {
    this.save('tictactoe_stats', stats);
  }

  /**
   * 加载井字棋游戏统计数据
   */
  loadTicTacToeStats(): TicTacToeStats {
    return this.load('tictactoe_stats', { xWins: 0, oWins: 0, draws: 0 });
  }

  /**
   * 保存井字棋游戏完整数据（包括状态）
   */
  saveTicTacToeGame(data: TicTacToeGameData): void {
    this.save('tictactoe', data);
  }

  /**
   * 加载井字棋游戏完整数据（包括状态）
   */
  loadTicTacToeGame(): TicTacToeGameData {
    return this.load('tictactoe', { 
      stats: { xWins: 0, oWins: 0, draws: 0 },
      gameState: null
    });
  }

  // ========== 俄罗斯方块游戏 ==========

  /**
   * 保存俄罗斯方块游戏统计数据
   */
  saveTetrisStats(stats: TetrisStats): void {
    this.save('tetris_stats', stats);
  }

  /**
   * 加载俄罗斯方块游戏统计数据
   */
  loadTetrisStats(): TetrisStats {
    return this.load('tetris_stats', { highScore: 0 });
  }

  /**
   * 保存俄罗斯方块游戏完整数据（包括状态）
   */
  saveTetrisGame(data: TetrisGameData): void {
    this.save('tetris', data);
  }

  /**
   * 加载俄罗斯方块游戏完整数据（包括状态）
   */
  loadTetrisGame(): TetrisGameData {
    return this.load('tetris', {
      stats: { highScore: 0 },
      gameState: null
    });
  }

  // ========== 国际跳棋游戏 ==========

  /**
   * 保存国际跳棋游戏统计数据
   */
  saveInternationalCheckersStats(stats: InternationalCheckersStats): void {
    this.save('international_checkers_stats', stats);
  }

  /**
   * 加载国际跳棋游戏统计数据
   */
  loadInternationalCheckersStats(): InternationalCheckersStats {
    return this.load('international_checkers_stats', {
      redWins: 0,
      blackWins: 0,
    });
  }

  /**
   * 保存国际跳棋游戏完整数据（包括状态）
   */
  saveInternationalCheckersGame(data: InternationalCheckersGameData): void {
    this.save('international_checkers', data);
  }

  /**
   * 加载国际跳棋游戏完整数据（包括状态）
   */
  loadInternationalCheckersGame(): InternationalCheckersGameData {
    return this.load('international_checkers', {
      stats: {
        redWins: 0,
        blackWins: 0,
      },
      gameState: null
    });
  }

  // ========== 国际象棋游戏 ==========

  /**
   * 保存国际象棋游戏统计数据
   */
  saveChessStats(stats: ChessStats): void {
    this.save('chess_stats', stats);
  }

  /**
   * 加载国际象棋游戏统计数据
   */
  loadChessStats(): ChessStats {
    return this.load('chess_stats', {
      whiteWins: 0,
      blackWins: 0,
    });
  }

  /**
   * 保存国际象棋游戏完整数据（包括状态）
   */
  saveChessGame(data: ChessGameData): void {
    this.save('chess', data);
  }

  /**
   * 加载国际象棋游戏完整数据（包括状态）
   */
  loadChessGame(): ChessGameData {
    return this.load('chess', {
      stats: {
        whiteWins: 0,
        blackWins: 0,
      },
      gameState: null
    });
  }

  // ========== 扫雷游戏 ==========

  /**
   * 保存扫雷游戏完整数据（包括状态）
   */
  saveMinesweeperGame(data: MinesweeperGameData): void {
    this.save('minesweeper', data);
  }

  /**
   * 加载扫雷游戏完整数据（包括状态）
   */
  loadMinesweeperGame(): MinesweeperGameData {
    return this.load('minesweeper', {
      stats: {
        gamesPlayed: 0,
        gamesWon: 0,
        gamesLost: 0,
        bestTimes: {
          easy: null,
          medium: null,
          hard: null,
        },
      },
      gameState: null
    });
  }

  // ========== 通知 ==========

  /**
   * 保存通知数据
   */
  saveNotifications(data: NotificationData): void {
    this.save('notifications', data);
  }

  /**
   * 加载通知数据
   */
  loadNotifications(): NotificationData {
    return this.load('notifications', { notifications: [] });
  }
}

// 导出单例实例
export const persistenceService = new PersistenceService();