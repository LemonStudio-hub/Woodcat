/**
 * 井字棋游戏逻辑
 * 使用 Composition API 管理游戏状态
 */

import { ref, computed, watch } from 'vue';
import { Cell, GameState, WINNING_COMBINATIONS, BOARD_SIZE, GameMode } from '@/constants/ticTacToeConstants';
import { persistenceService } from '@/services/persistenceService';
import { audioService, SoundType } from '@/services/audioService';
import { vibrationService } from '@/services/vibrationService';

/**
 * 棋盘状态（一维数组）
 */
const board = ref<Cell[]>([]);

/**
 * 当前玩家
 */
const currentPlayer = ref<Cell>(Cell.X);

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
const aiPlayer = ref<Cell | null>(null);

/**
 * X 获胜次数
 */
const xWins = ref<number>(0);

/**
 * O 获胜次数
 */
const oWins = ref<number>(0);

/**
 * 平局次数
 */
const draws = ref<number>(0);

/**
 * 获胜连线（游戏结束时显示获胜的三子连线）
 */
const winningCombination = ref<number[] | null>(null);

/**
 * 是否正在等待AI下棋
 */
const isAIThinking = ref<boolean>(false);

// ========== 持久化 ==========

/**
 * 加载游戏状态
 */
function loadGameState(): void {
  const data = persistenceService.loadTicTacToeGame();
  
  // 加载统计数据
  xWins.value = data.stats.xWins;
  oWins.value = data.stats.oWins;
  draws.value = data.stats.draws;

  // 初始化新游戏
  initBoard();
}

/**
 * 清除游戏状态
 */
function clearGameState(): void {
  const data = persistenceService.loadTicTacToeGame();
  persistenceService.saveTicTacToeGame({
    stats: data.stats,
    gameState: null,
  });
}

// 监听数据变化，自动保存
  watch([xWins, oWins, draws], () => {
  // 统计数据变化时自动保存
  const data = persistenceService.loadTicTacToeGame();
  persistenceService.saveTicTacToeGame({
    stats: {
      xWins: xWins.value,
      oWins: oWins.value,
      draws: draws.value,
    },
    gameState: data.gameState,
  });
});

// 初始化时加载数据
loadGameState();

// ========== 计算属性 ==========

/**
 * 游戏状态文本
 */
const statusText = computed((): string => {
  if (gameState.value === GameState.X_WINS) return 'X 获胜！';
  if (gameState.value === GameState.O_WINS) return 'O 获胜！';
  if (gameState.value === GameState.DRAW) return '平局！';
  return `当前回合：${currentPlayer.value}`;
});

// ========== 游戏逻辑 ==========

/**
 * 初始化棋盘
 */
function initBoard(): void {
  board.value = Array(BOARD_SIZE * BOARD_SIZE).fill(Cell.EMPTY);
}

/**
 * 检查是否获胜
 */
function checkWin(boardState: Cell[], cell: Cell): boolean {
  for (const combination of WINNING_COMBINATIONS) {
    if (combination.every((index) => boardState[index] === cell)) {
      winningCombination.value = combination;
      return true;
    }
  }
  return false;
}

/**
 * 检查是否平局
 */
function checkDraw(boardState: Cell[]): boolean {
  return boardState.every((cell) => cell !== Cell.EMPTY);
}

/**
 * Minimax算法实现
 * 返回当前棋盘状态的最佳得分
 */
function minimax(
  boardState: Cell[],
  depth: number,
  isMaximizing: boolean,
  ai: Cell,
  human: Cell
): number {
  // 检查游戏是否结束
  if (checkWin(boardState, ai)) {
    return 10 - depth;
  }
  if (checkWin(boardState, human)) {
    return depth - 10;
  }
  if (checkDraw(boardState)) {
    return 0;
  }

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (boardState[i] === Cell.EMPTY) {
        boardState[i] = ai;
        const score = minimax(boardState, depth + 1, false, ai, human);
        boardState[i] = Cell.EMPTY;
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (boardState[i] === Cell.EMPTY) {
        boardState[i] = human;
        const score = minimax(boardState, depth + 1, true, ai, human);
        boardState[i] = Cell.EMPTY;
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

/**
 * AI选择最佳位置
 */
function getAIMove(): number | null {
  if (!aiPlayer.value) return null;

  const ai = aiPlayer.value;
  const human = aiPlayer.value === Cell.X ? Cell.O : Cell.X;

  let bestScore = -Infinity;
  let bestMove: number | null = null;

  for (let i = 0; i < 9; i++) {
    if (board.value[i] === Cell.EMPTY) {
      board.value[i] = ai;
      const score = minimax(board.value, 0, false, ai, human);
      board.value[i] = Cell.EMPTY;

      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }

  return bestMove;
}

/**
 * AI下棋
 */
function aiMove(): void {
  if (gameState.value !== GameState.PLAYING || currentPlayer.value !== aiPlayer.value) {
    return;
  }

  isAIThinking.value = true;

  // 延迟一下，让用户看到AI在思考
  setTimeout(() => {
    const move = getAIMove();

    if (move !== null) {
      // 重置思考状态
      isAIThinking.value = false;
      // AI落子，传递 isAIMove = true
      placePiece(move, true);
    } else {
      // 如果AI无法落子，重置思考状态
      isAIThinking.value = false;
    }
  }, 500);
}

/**
 * 放置棋子
 */
function placePiece(index: number, isAIMove: boolean = false): boolean {
  // 检查游戏是否结束
  if (gameState.value !== GameState.PLAYING) {
    return false;
  }

  // 检查位置是否为空
  if (board.value[index] !== Cell.EMPTY) {
    return false;
  }

  // 如果AI正在思考，禁止玩家落子
  if (isAIThinking.value && !isAIMove) {
    return false;
  }

  // 如果是人机模式且当前是AI的回合，禁止玩家落子
  if (gameMode.value === GameMode.PVE && currentPlayer.value === aiPlayer.value && !isAIMove) {
    return false;
  }

  // 放置棋子
  board.value[index] = currentPlayer.value;

  // 播放落子音效
  if (currentPlayer.value === Cell.X) {
    audioService.play(SoundType.PLACE_X);
    vibrationService.vibrateCustom([20]);
  } else {
    audioService.play(SoundType.PLACE_O);
    vibrationService.vibrateCustom([18]);
  }

  // 检查是否获胜
  if (checkWin(board.value, currentPlayer.value)) {
    gameState.value =
      currentPlayer.value === Cell.X ? GameState.X_WINS : GameState.O_WINS;

    // 更新获胜次数
    if (gameState.value === GameState.X_WINS) {
      xWins.value++;
    } else {
      oWins.value++;
    }

    audioService.play(SoundType.WIN);
    vibrationService.vibrateCustom([100, 50, 100, 50, 150]);
    return true;
  }

  // 检查是否平局
  if (checkDraw(board.value)) {
    gameState.value = GameState.DRAW;
    draws.value++;
    audioService.play(SoundType.DRAW);
    vibrationService.vibrateCustom([50, 30, 50, 30, 50]);
    return true;
  }

  // 切换玩家
  currentPlayer.value = currentPlayer.value === Cell.X ? Cell.O : Cell.X;

  // 如果是人机模式且轮到 AI，触发AI下棋
  if (gameMode.value === GameMode.PVE && currentPlayer.value === aiPlayer.value) {
    aiMove();
  }

  return true;
}

/**
 * 开始新游戏
 */
function startNewGame(): void {
  initBoard();
  gameState.value = GameState.PLAYING;
  isAIThinking.value = false;
  winningCombination.value = null; // 清空获胜连线

  // X始终先手
  currentPlayer.value = Cell.X;

  // 如果是人机模式，随机分配棋色
  if (gameMode.value === GameMode.PVE) {
    const aiIsX = Math.random() < 0.5;

    if (aiIsX) {
      // AI 是 X（先手），用户是 O
      aiPlayer.value = Cell.X;
      // AI 自动下第一步棋
      setTimeout(() => {
        aiMove();
      }, 300);
    } else {
      // 用户是 X（先手），AI 是 O
      aiPlayer.value = Cell.O;
    }
  } else {
    // 双人对战模式
    aiPlayer.value = null;
  }
}

/**
 * 重置所有统计数据
 */
function resetAllStats(): void {
  xWins.value = 0;
  oWins.value = 0;
  draws.value = 0;
  startNewGame();
}

/**
 * 导出游戏逻辑
 */
export function useTicTacToeGame() {
  return {
    // 状态
    board,
    currentPlayer,
    gameState,
    gameMode,
    aiPlayer,
    xWins,
    oWins,
    draws,
    isAIThinking,
    winningCombination,
    statusText,
    // 方法
    placePiece,
    startNewGame,
    resetAllStats,
    loadGameState,
    clearGameState,
  };
}