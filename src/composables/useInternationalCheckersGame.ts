/**
 * 国际跳棋游戏逻辑组合式函数
 * 封装游戏核心逻辑和AI算法
 */

import { ref, computed, watch } from 'vue';
import {
  BOARD_SIZE,
  Player,
  GameState,
  GameMode,
  PieceType,
  Coord,
  Piece,
  ValidMove,
  MoveType,
  DIRECTIONS,
  AIDifficulty,
  PLAYER_NAMES,
} from '@/constants/internationalCheckersConstants';
import { persistenceService } from '@/services/persistenceService';
import { audioService, SoundType } from '@/services/audioService';
import { vibrationService, VibrationType } from '@/services/vibrationService';

/**
 * 国际跳棋游戏逻辑
 */
export function useInternationalCheckersGame() {
  // ========== 状态 ==========

  /**
   * 棋盘上的棋子
   */
  const pieces = ref<Piece[]>([]);

  /**
   * 当前玩家
   */
  const currentPlayer = ref<Player>(Player.RED);

  /**
   * 游戏状态
   */
  const gameState = ref<GameState>(GameState.PLAYING);

  /**
   * 游戏模式
   */
  const gameMode = ref<GameMode>(GameMode.PVP);

  /**
   * AI 玩家
   */
  const aiPlayer = ref<Player | null>(null);

  /**
   * AI 难度
   */
  const aiDifficulty = ref<AIDifficulty>(AIDifficulty.MEDIUM);

  /**
   * 选中的棋子
   */
  const selectedPiece = ref<Piece | null>(null);

  /**
   * 可用的移动
   */
  const validMoves = ref<ValidMove[]>([]);

  /**
   * 是否正在进行连续跳跃
   */
  const isChainJumping = ref<boolean>(false);

  /**
   * 连续跳跃的棋子
   */
  const chainJumpPiece = ref<Piece | null>(null);

  /**
   * 白色获胜次数
   */
  const redWins = ref<number>(0);

  /**
   * 黑色获胜次数
   */
  const blackWins = ref<number>(0);

  /**
   * 下一个棋子 ID
   */
  let nextPieceId = 0;

  // ========== 辅助函数 ==========

  /**
   * 比较两个坐标是否相等
   */
  function coordEqual(a: Coord, b: Coord): boolean {
    return a.row === b.row && a.col === b.col;
  }

  /**
   * 检查坐标是否在棋盘内
   */
  function isValidCoord(coord: Coord): boolean {
    return coord.row >= 0 && coord.row < BOARD_SIZE && coord.col >= 0 && coord.col < BOARD_SIZE;
  }

  /**
   * 检查坐标是否是深色格子（可以放置棋子）
   */
  function isDarkSquare(coord: Coord): boolean {
    return (coord.row + coord.col) % 2 === 1;
  }

  /**
   * 获取指定坐标的棋子
   */
  function getPieceAt(coord: Coord): Piece | undefined {
    return pieces.value.find((piece) => coordEqual(piece.position, coord));
  }

  /**
   * 检查坐标是否为空
   */
  function isEmptySquare(coord: Coord): boolean {
    return getPieceAt(coord) === undefined;
  }

  // ========== 棋盘初始化 ==========

  /**
   * 初始化棋盘
   */
  function initBoard(): void {
    pieces.value = [];
    nextPieceId = 0;

    // 在深色格子上放置黑色棋子（上方三行）
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const coord: Coord = { row, col };
        if (isDarkSquare(coord)) {
          pieces.value.push({
            id: nextPieceId++,
            player: Player.BLACK,
            position: coord,
            type: PieceType.NORMAL,
          });
        }
      }
    }

    // 在深色格子上放置红色棋子（下方三行）
    for (let row = 5; row < 8; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const coord: Coord = { row, col };
        if (isDarkSquare(coord)) {
          pieces.value.push({
            id: nextPieceId++,
            player: Player.RED,
            position: coord,
            type: PieceType.NORMAL,
          });
        }
      }
    }
  }

  // ========== 移动逻辑 ==========

  /**
   * 获取指定棋子的有效移动
   */
  function getValidMoves(piece: Piece, forceJump: boolean = false): ValidMove[] {
    const moves: ValidMove[] = [];
    const jumpMoves: ValidMove[] = [];

    // 确定棋子可以移动的方向
    let directions: Array<{ row: number; col: number }> = [];

    if (piece.type === PieceType.KING) {
      // 王可以向任意斜向移动
      directions = [
        DIRECTIONS.UP_LEFT,
        DIRECTIONS.UP_RIGHT,
        DIRECTIONS.DOWN_LEFT,
        DIRECTIONS.DOWN_RIGHT,
      ];
    } else if (piece.player === Player.RED) {
      // 红色棋子向上移动
      directions = [DIRECTIONS.UP_LEFT, DIRECTIONS.UP_RIGHT];
    } else {
      // 黑色棋子向下移动
      directions = [DIRECTIONS.DOWN_LEFT, DIRECTIONS.DOWN_RIGHT];
    }

    // 检查所有可能的移动
    directions.forEach((dir) => {
      // 检查单步移动
      const stepCoord: Coord = {
        row: piece.position.row + dir.row,
        col: piece.position.col + dir.col,
      };

      if (isValidCoord(stepCoord) && isEmptySquare(stepCoord)) {
        moves.push({
          from: piece.position,
          to: stepCoord,
          type: MoveType.STEP,
          promotion: shouldPromote(piece, stepCoord),
        });
      }

      // 检查跳跃移动
      const jumpCoord: Coord = {
        row: piece.position.row + dir.row * 2,
        col: piece.position.col + dir.col * 2,
      };
      const capturedCoord: Coord = {
        row: piece.position.row + dir.row,
        col: piece.position.col + dir.col,
      };

      if (
        isValidCoord(jumpCoord) &&
        isEmptySquare(jumpCoord) &&
        !isEmptySquare(capturedCoord)
      ) {
        const capturedPiece = getPieceAt(capturedCoord);
        if (capturedPiece && capturedPiece.player !== piece.player) {
          jumpMoves.push({
            from: piece.position,
            to: jumpCoord,
            type: MoveType.JUMP,
            captured: capturedCoord,
            promotion: shouldPromote(piece, jumpCoord),
          });
        }
      }
    });

    // 如果有跳跃移动，必须跳跃（规则强制）
    if (jumpMoves.length > 0) {
      return jumpMoves;
    }

    // 如果强制跳跃但没有跳跃移动，返回空
    if (forceJump) {
      return [];
    }

    return moves;
  }

  /**
   * 检查棋子是否应该升级为王
   */
  function shouldPromote(piece: Piece, to: Coord): boolean {
    if (piece.type === PieceType.KING) return false;

    if (piece.player === Player.RED) {
      return to.row === 0;
    } else {
      return to.row === BOARD_SIZE - 1;
    }
  }

  /**
   * 检查是否有玩家有可跳跃的移动
   */
  function hasJumpMoves(player: Player): boolean {
    const playerPieces = pieces.value.filter((p) => p.player === player);
    return playerPieces.some((piece) => {
      const moves = getValidMoves(piece, true);
      return moves.length > 0;
    });
  }

  /**
   * 选择棋子
   */
  function selectPiece(piece: Piece): void {
    if (gameState.value !== GameState.PLAYING) return;
    if (piece.player !== currentPlayer.value) return;

    // 如果正在进行连续跳跃，只能选择正在跳跃的棋子
    if (isChainJumping.value && chainJumpPiece.value?.id !== piece.id) {
      return;
    }

    // 检查是否必须跳跃
    const forceJump = hasJumpMoves(currentPlayer.value);

    selectedPiece.value = piece;
    validMoves.value = getValidMoves(piece, forceJump);
  }

  /**
   * 取消选择
   */
  function deselectPiece(): void {
    selectedPiece.value = null;
    validMoves.value = [];
  }

  /**
   * 移动棋子
   */
  function movePiece(move: ValidMove): boolean {
    if (!selectedPiece.value) return false;

    const piece = selectedPiece.value;

    // 移动棋子
    piece.position = move.to;

    // 如果是跳跃移动，移除被吃掉的棋子
    if (move.type === MoveType.JUMP && move.captured) {
      const capturedIndex = pieces.value.findIndex((p) => coordEqual(p.position, move.captured!));
      if (capturedIndex !== -1) {
        pieces.value.splice(capturedIndex, 1);
        audioService.play(SoundType.MERGE);
        vibrationService.vibrate(VibrationType.MERGE);
      }

      // 检查是否可以继续跳跃
      const additionalJumps = getValidMoves(piece, true);
      if (additionalJumps.length > 0 && !move.promotion) {
        // 继续跳跃
        isChainJumping.value = true;
        chainJumpPiece.value = piece;
        selectedPiece.value = piece;
        validMoves.value = additionalJumps;
        return true;
      }
    } else {
      audioService.play(SoundType.MOVE);
      vibrationService.vibrate(VibrationType.MOVE);
    }

    // 检查是否升级为王
    if (move.promotion) {
      piece.type = PieceType.KING;
      audioService.play(SoundType.WIN);
      vibrationService.vibrate(VibrationType.WIN);
    }

    // 结束连续跳跃
    isChainJumping.value = false;
    chainJumpPiece.value = null;

    // 清除选择
    deselectPiece();

    // 检查是否获胜
    if (checkWin()) {
      const winner = currentPlayer.value;
      gameState.value = winner === Player.RED ? GameState.RED_WINS : GameState.BLACK_WINS;
      updateWinCount(winner);
      audioService.play(SoundType.WIN);
      vibrationService.vibrate(VibrationType.WIN);
      return true;
    }

    // 切换玩家
    currentPlayer.value = currentPlayer.value === Player.RED ? Player.BLACK : Player.RED;

    // 如果是人机模式且轮到 AI，触发AI下棋
    if (gameMode.value === GameMode.PVE && currentPlayer.value === aiPlayer.value) {
      setTimeout(() => {
        aiMove();
      }, 500);
    }

    return true;
  }

  // ========== 获胜检测 ==========

  /**
   * 检查是否获胜
   */
  function checkWin(): boolean {
    const redPieces = pieces.value.filter((p) => p.player === Player.RED);
    const blackPieces = pieces.value.filter((p) => p.player === Player.BLACK);

    // 如果一方没有棋子，对方获胜
    if (redPieces.length === 0) return true;
    if (blackPieces.length === 0) return true;

    // 检查当前玩家是否有可移动的棋子
    const currentPlayerPieces = pieces.value.filter((p) => p.player === currentPlayer.value);
    const hasValidMove = currentPlayerPieces.some((piece) => {
      const forceJump = hasJumpMoves(currentPlayer.value);
      return getValidMoves(piece, forceJump).length > 0;
    });

    // 如果没有可移动的棋子，对方获胜
    if (!hasValidMove) return true;

    return false;
  }

  /**
   * 更新获胜次数
   */
  function updateWinCount(player: Player): void {
    if (player === Player.RED) {
      redWins.value++;
    } else {
      blackWins.value++;
    }
  }

  // ========== 计算属性 ==========

  /**
   * 游戏状态文本
   */
  const statusText = computed((): string => {
    if (gameState.value === GameState.RED_WINS) return '白色获胜！';
    if (gameState.value === GameState.BLACK_WINS) return '黑色获胜！';
    if (gameState.value === GameState.DRAW) return '平局！';

    if (gameMode.value === GameMode.PVE) {
      return currentPlayer.value === aiPlayer.value ? 'AI思考中...' : '你的回合';
    }

    const playerName = PLAYER_NAMES[currentPlayer.value];
    return `${playerName}回合`;
  });

  // ========== AI算法 ==========

  /**
   * 评估棋盘状态
   */
  function evaluateBoard(player: Player): number {
    let score = 0;

    pieces.value.forEach((piece) => {
      const pieceValue = piece.type === PieceType.KING ? 3 : 1;

      // 位置评估（越靠近对方底线越好）
      let positionValue = 0;
      if (piece.player === Player.RED) {
        positionValue = (BOARD_SIZE - 1 - piece.position.row) / BOARD_SIZE;
      } else {
        positionValue = piece.position.row / BOARD_SIZE;
      }

      if (piece.player === player) {
        score += pieceValue + positionValue;
      } else {
        score -= pieceValue + positionValue;
      }
    });

    return score;
  }

  /**
   * AI选择最佳移动
   */
  function getAIMove(): ValidMove | null {
    if (!aiPlayer.value) return null;

    const player = aiPlayer.value;
    const opponent = player === Player.RED ? Player.BLACK : Player.RED;
    let bestScore = -Infinity;
    let bestMove: ValidMove | null = null;

    const playerPieces = pieces.value.filter((p) => p.player === player);
    const forceJump = hasJumpMoves(player);

    playerPieces.forEach((piece) => {
      const moves = getValidMoves(piece, forceJump);

      moves.forEach((move) => {
        // 模拟移动
        const capturedPiece = move.captured ? getPieceAt(move.captured) : null;
        const oldPosition = { ...piece.position };
        const oldType = piece.type;

        // 执行移动
        piece.position = move.to;
        if (move.promotion) {
          piece.type = PieceType.KING;
        }
        if (capturedPiece) {
          const capturedIndex = pieces.value.findIndex((p) => p.id === capturedPiece!.id);
          if (capturedIndex !== -1) {
            pieces.value.splice(capturedIndex, 1);
          }
        }

        // 评估棋盘
        let score = evaluateBoard(player);

        // 根据难度调整评估
        if (aiDifficulty.value === AIDifficulty.EASY) {
          score += Math.random() * 2 - 1; // 添加随机性
        } else if (aiDifficulty.value === AIDifficulty.HARD) {
          // 简单的向前看一步
          const opponentPieces = pieces.value.filter((p) => p.player === opponent);
          const opponentForceJump = hasJumpMoves(opponent);
          let opponentBestScore = Infinity;

          opponentPieces.forEach((opPiece) => {
            const opMoves = getValidMoves(opPiece, opponentForceJump);
            opMoves.forEach((opMove) => {
              // 模拟对手移动
              const opCaptured = opMove.captured ? getPieceAt(opMove.captured) : null;
              const opOldPos = { ...opPiece.position };
              const opOldType = opPiece.type;

              opPiece.position = opMove.to;
              if (opMove.promotion) {
                opPiece.type = PieceType.KING;
              }
              if (opCaptured) {
                const opCapturedIndex = pieces.value.findIndex((p) => p.id === opCaptured!.id);
                if (opCapturedIndex !== -1) {
                  pieces.value.splice(opCapturedIndex, 1);
                }
              }

              const opScore = evaluateBoard(opponent);
              if (opScore < opponentBestScore) {
                opponentBestScore = opScore;
              }

              // 恢复对手移动
              opPiece.position = opOldPos;
              opPiece.type = opOldType;
              if (opCaptured) {
                pieces.value.push(opCaptured);
              }
            });
          });

          score -= opponentBestScore;
        }

        // 恢复移动
        piece.position = oldPosition;
        piece.type = oldType;
        if (capturedPiece) {
          pieces.value.push(capturedPiece);
        }

        if (score > bestScore) {
          bestScore = score;
          bestMove = move;
        }
      });
    });

    return bestMove;
  }

  /**
   * AI下棋
   */
  function aiMove(): void {
    if (gameState.value !== GameState.PLAYING) return;
    if (currentPlayer.value !== aiPlayer.value) return;

    const move = getAIMove();
    if (move) {
      const piece = getPieceAt(move.from);
      if (piece) {
        selectPiece(piece);
        setTimeout(() => {
          movePiece(move);
        }, 300);
      }
    }
  }

  // ========== 持久化 ==========

  /**
   * 加载游戏状态
   */
  function loadGameState(): void {
    const data = persistenceService.loadInternationalCheckersGame();

    // 加载统计数据
    redWins.value = data.stats.redWins;
    blackWins.value = data.stats.blackWins;

    // 初始化新游戏
    initBoard();
  }

  /**
   * 清除游戏状态
   */
  function clearGameState(): void {
    const data = persistenceService.loadInternationalCheckersGame();
    persistenceService.saveInternationalCheckersGame({
      stats: data.stats,
      gameState: null,
    });
  }

  // 监听数据变化，自动保存
  watch([redWins, blackWins], () => {
    const data = persistenceService.loadInternationalCheckersGame();
    persistenceService.saveInternationalCheckersGame({
      stats: {
        redWins: redWins.value,
        blackWins: blackWins.value,
      },
      gameState: data.gameState,
    });
  });

  // 初始化时加载数据
  loadGameState();

  // ========== 游戏控制 ==========

  /**
   * 开始新游戏
   */
  function startNewGame(): void {
    initBoard();
    gameState.value = GameState.PLAYING;
    currentPlayer.value = Player.RED;
    deselectPiece();
    isChainJumping.value = false;
    chainJumpPiece.value = null;

    // 如果是人机模式，随机分配棋色
    if (gameMode.value === GameMode.PVE) {
      const aiIsBlack = Math.random() < 0.5;
      aiPlayer.value = aiIsBlack ? Player.BLACK : Player.RED;

      // 如果AI是红色（先手），AI先走
      if (!aiIsBlack) {
        setTimeout(() => {
          aiMove();
        }, 500);
      }
    } else {
      aiPlayer.value = null;
    }
  }

  /**
   * 设置游戏模式
   */
  function setGameMode(mode: GameMode): void {
    gameMode.value = mode;
    startNewGame();
  }

  /**
   * 设置AI难度
   */
  function setAIDifficulty(difficulty: AIDifficulty): void {
    aiDifficulty.value = difficulty;
  }

  /**
   * 重置所有统计数据
   */
  function resetAllStats(): void {
    redWins.value = 0;
    blackWins.value = 0;
    startNewGame();
  }

  return {
    // 状态
    pieces,
    currentPlayer,
    gameState,
    gameMode,
    aiPlayer,
    aiDifficulty,
    selectedPiece,
    validMoves,
    isChainJumping,
    redWins,
    blackWins,
    statusText,
    // 方法
    selectPiece,
    deselectPiece,
    movePiece,
    startNewGame,
    setGameMode,
    setAIDifficulty,
    resetAllStats,
    initBoard,
    loadGameState,
    clearGameState,
    // 辅助函数
    getPieceAt,
    coordEqual,
    isDarkSquare,
  };
}