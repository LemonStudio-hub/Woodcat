/**
 * 五子棋游戏逻辑组合式函数
 * 封装游戏核心逻辑和AI算法
 */

import { ref, computed } from 'vue';
import {
  BOARD_SIZE,
  Player,
  GameState,
  GameMode,
} from '@/constants/gomokuConstants';

/**
 * 五子棋游戏逻辑
 */
export function useGomokuGame() {
  // ========== 状态 ==========
  
  /**
   * 棋盘状态（二维数组）
   */
  const board = ref<Player[][]>([]);
  
  /**
   * 当前玩家
   */
  const currentPlayer = ref<Player>(Player.BLACK);
  
  /**
   * 游戏状态
   */
  const gameState = ref<GameState>(GameState.PLAYING);
  
  /**
   * 游戏模式
   */
  const gameMode = ref<GameMode>(GameMode.PVP);
  
  /**
   * AI 玩家（人机模式下）
   */
  const aiPlayer = ref<Player | null>(null);
  
  /**
   * 黑子获胜次数
   */
  const blackWins = ref<number>(0);
  
  /**
   * 白子获胜次数
   */
  const whiteWins = ref<number>(0);
  
  /**
   * 是否正在等待AI下棋
   */
  const isAIThinking = ref<boolean>(false);
  
  // ========== 计算属性 ==========
  
  /**
   * 游戏状态文本
   */
  const statusText = computed((): string => {
    if (gameState.value === GameState.BLACK_WINS) return '黑子获胜！';
    if (gameState.value === GameState.WHITE_WINS) return '白子获胜！';
    if (gameState.value === GameState.DRAW) return '平局！';
    
    if (gameMode.value === GameMode.PVE) {
      return currentPlayer.value === aiPlayer.value ? 'AI思考中...' : '你的回合';
    }
    
    return currentPlayer.value === Player.BLACK ? '黑子回合' : '白子回合';
  });

  // ========== AI算法 ==========
  
  /**
   * 评估某个位置的分数
   */
  function evaluatePosition(row: number, col: number, player: Player): number {
    let score = 0;
    
    // 检查四个方向
    const directions = [
      [[0, 1], [0, -1]],   // 水平
      [[1, 0], [-1, 0]],   // 垂直
      [[1, 1], [-1, -1]], // 对角线
      [[1, -1], [-1, 1]], // 反对角线
    ];
    
    for (const direction of directions) {
      let consecutive = 0;
      let blockedEnds = 0;
      
      for (const [dx, dy] of direction) {
        let r = row + dx;
        let c = col + dy;
        
        while (
          r >= 0 &&
          r < BOARD_SIZE &&
          c >= 0 &&
          c < BOARD_SIZE
        ) {
          if (board.value[r][c] === player) {
            consecutive++;
          } else if (board.value[r][c] === Player.EMPTY) {
            break;
          } else {
            blockedEnds++;
            break;
          }
          r += dx;
          c += dy;
        }
      }
      
      // 根据连子数和被阻挡的端数计算分数
      if (consecutive >= 4) {
        score += 100000; // 必胜
      } else if (consecutive === 3) {
        if (blockedEnds === 0) {
          score += 10000; // 活四
        } else if (blockedEnds === 1) {
          score += 1000; // 冲四
        }
      } else if (consecutive === 2) {
        if (blockedEnds === 0) {
          score += 1000; // 活三
        } else if (blockedEnds === 1) {
          score += 100; // 眠三
        }
      } else if (consecutive === 1) {
        if (blockedEnds === 0) {
          score += 100; // 活二
        } else if (blockedEnds === 1) {
          score += 10; // 眠二
        }
      }
    }
    
    return score;
  }
  
  /**
   * AI选择最佳位置
   */
  function getAIMove(): { row: number; col: number } | null {
    if (!aiPlayer.value) return null;
    
    const player = aiPlayer.value;
    const opponent = player === Player.BLACK ? Player.WHITE : Player.BLACK;
    let bestScore = -Infinity;
    let bestMove: { row: number; col: number } | null = null;
    
    // 寻找空位
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (board.value[row][col] === Player.EMPTY) {
          // 计算进攻分数
          const attackScore = evaluatePosition(row, col, player);
          
          // 计算防守分数（考虑对方的威胁）
          const defendScore = evaluatePosition(row, col, opponent);
          
          // 综合分数，防守优先
          const totalScore = Math.max(attackScore, defendScore * 1.1);
          
          if (totalScore > bestScore) {
            bestScore = totalScore;
            bestMove = { row, col };
          }
        }
      }
    }
    
    // 如果没有好的位置，选择中心附近的空位
    if (bestMove === null || bestScore < 100) {
      const center = Math.floor(BOARD_SIZE / 2);
      for (let r = center - 2; r <= center + 2; r++) {
        for (let c = center - 2; c <= center + 2; c++) {
          if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
            if (board.value[r][c] === Player.EMPTY) {
              return { row: r, col: c };
            }
          }
        }
      }
    }
    
    return bestMove;
  }
  
  /**
   * AI下棋
   */
  function aiMove(): void {
    console.log('aiMove called', {
      gameState: gameState.value,
      currentPlayer: currentPlayer.value,
      aiPlayer: aiPlayer.value,
      gameMode: gameMode.value,
      isAIThinking: isAIThinking.value
    });
    
    if (gameState.value !== GameState.PLAYING || currentPlayer.value !== aiPlayer.value) {
      console.log('aiMove returned early');
      return;
    }
    
    isAIThinking.value = true;
    
    // 延迟一下，让用户看到AI在思考
    setTimeout(() => {
      const move = getAIMove();
      
      console.log('AI move result', move);
      
      if (move) {
        // 重置思考状态，允许AI落子
        isAIThinking.value = false;
        placePiece(move.row, move.col);
      } else {
        // 如果AI无法落子，重置思考状态
        isAIThinking.value = false;
      }
    }, 500);
  }

  // ========== 辅助函数 ==========
  
  /**
   * 初始化棋盘
   */
  function initBoard(): void {
    board.value = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
      board.value.push(new Array(BOARD_SIZE).fill(Player.EMPTY));
    }
  }
  
  /**
   * 检查是否获胜
   */
  function checkWin(row: number, col: number, player: Player): boolean {
    // 检查四个方向：水平、垂直、对角线、反对角线
    const directions = [
      [[0, 1], [0, -1]],   // 水平
      [[1, 0], [-1, 0]],   // 垂直
      [[1, 1], [-1, -1]], // 对角线
      [[1, -1], [-1, 1]], // 反对角线
    ];
    
    for (const direction of directions) {
      let count = 1;
      
      for (const [dx, dy] of direction) {
        let r = row + dx;
        let c = col + dy;
        
        while (
          r >= 0 &&
          r < BOARD_SIZE &&
          c >= 0 &&
          c < BOARD_SIZE &&
          board.value[r][c] === player
        ) {
          count++;
          r += dx;
          c += dy;
        }
      }
      
      if (count >= 5) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * 检查是否平局
   */
  function checkDraw(): boolean {
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if (board.value[i][j] === Player.EMPTY) {
          return false;
        }
      }
    }
    return true;
  }
  
  /**
   * 放置棋子
   */
  function placePiece(row: number, col: number): boolean {
    console.log('placePiece called', { row, col, currentPlayer: currentPlayer.value, gameMode: gameMode.value, aiPlayer: aiPlayer.value });
    
    // 检查游戏是否结束
    if (gameState.value !== GameState.PLAYING) {
      console.log('placePiece: game not playing');
      return false;
    }
    
    // 检查位置是否为空
    if (board.value[row][col] !== Player.EMPTY) {
      console.log('placePiece: position not empty');
      return false;
    }
    
    // 如果是人机模式且当前是AI的回合，禁止玩家下棋
    if (gameMode.value === GameMode.PVE && currentPlayer.value === aiPlayer.value) {
      console.log('placePiece: AI turn, player cannot move');
      return false;
    }
    
    // 如果AI正在思考，禁止玩家下棋
    if (isAIThinking.value) {
      console.log('placePiece: AI is thinking');
      return false;
    }
    
    // 放置棋子
    board.value[row][col] = currentPlayer.value;
    
    // 检查是否获胜
    if (checkWin(row, col, currentPlayer.value)) {
      gameState.value =
        currentPlayer.value === Player.BLACK
          ? GameState.BLACK_WINS
          : GameState.WHITE_WINS;
      
      // 更新获胜次数
      if (gameState.value === GameState.BLACK_WINS) {
        blackWins.value++;
      } else {
        whiteWins.value++;
      }
      
      return true;
    }
    
    // 检查是否平局
    if (checkDraw()) {
      gameState.value = GameState.DRAW;
      return true;
    }
    
    // 切换玩家
    currentPlayer.value =
      currentPlayer.value === Player.BLACK ? Player.WHITE : Player.BLACK;
    
    console.log('placePiece: switched player', { newCurrentPlayer: currentPlayer.value, aiPlayer: aiPlayer.value });
    
    // 如果是人机模式且轮到 AI，触发AI下棋
    if (gameMode.value === GameMode.PVE && currentPlayer.value === aiPlayer.value) {
      console.log('placePiece: triggering AI move');
      aiMove();
    }
    
    return true;
  }
  
  /**
   * 开始新游戏
   */
  function startNewGame(): void {
    console.log('startNewGame called', { gameMode: gameMode.value });
    
    initBoard();
    gameState.value = GameState.PLAYING;
    isAIThinking.value = false;
    
    // 黑棋始终先手
    currentPlayer.value = Player.BLACK;
    
    // 如果是人机模式，随机分配棋色
    if (gameMode.value === GameMode.PVE) {
      const aiIsBlack = Math.random() < 0.5;
      
      console.log('startNewGame: assigning colors', { aiIsBlack });
      
      if (aiIsBlack) {
        // AI 是黑棋（先手），用户是白棋
        aiPlayer.value = Player.BLACK;
        // AI 自动下第一步棋
        setTimeout(() => {
          console.log('startNewGame: triggering AI first move');
          aiMove();
        }, 300);
      } else {
        // 用户是黑棋（先手），AI 是白棋
        aiPlayer.value = Player.WHITE;
      }
    } else {
      // 双人对战模式
      aiPlayer.value = null;
    }
    
    console.log('startNewGame completed', { currentPlayer: currentPlayer.value, aiPlayer: aiPlayer.value });
  }
  
  /**
   * 设置游戏模式
   */
  function setGameMode(mode: GameMode): void {
    gameMode.value = mode;
    startNewGame();
  }
  
  /**
   * 重置所有统计数据
   */
  function resetAllStats(): void {
    blackWins.value = 0;
    whiteWins.value = 0;
    startNewGame();
  }

  return {
    // 状态
    board,
    currentPlayer,
    gameState,
    gameMode,
    aiPlayer,
    blackWins,
    whiteWins,
    isAIThinking,
    statusText,
    // 方法
    placePiece,
    startNewGame,
    setGameMode,
    resetAllStats,
  };
}