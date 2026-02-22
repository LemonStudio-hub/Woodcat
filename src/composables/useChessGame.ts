/**
 * 国际象棋游戏逻辑组合式函数
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
  SpecialMove,
  AIDifficulty,
  PLAYER_NAMES,
} from '@/constants/chessConstants';
import { persistenceService } from '@/services/persistenceService';
import { audioService, SoundType } from '@/services/audioService';
import { vibrationService, VibrationType } from '@/services/vibrationService';

/**
 * 国际象棋游戏逻辑
 */
export function useChessGame() {
  // ========== 状态 ==========

  /**
   * 棋盘上的棋子
   */
  const pieces = ref<Piece[]>([]);

  /**
   * 当前玩家
   */
  const currentPlayer = ref<Player>(Player.WHITE);

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
   * 是否被将军
   */
  const isInCheck = ref<boolean>(false);

  /**
   * 白方获胜次数
   */
  const whiteWins = ref<number>(0);

  /**
   * 黑方获胜次数
   */
  const blackWins = ref<number>(0);

  /**
   * 下一个棋子 ID
   */
  let nextPieceId = 0;

  /**
   * 吃过路兵的位置
   */
  let enPassantTarget: Coord | null = null;

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
    enPassantTarget = null;

    // 初始化黑色棋子（上方）
    const blackPieces: Piece[] = [
      // 车
      { id: nextPieceId++, type: PieceType.ROOK, player: Player.BLACK, position: { row: 0, col: 0 }, hasMoved: false },
      { id: nextPieceId++, type: PieceType.ROOK, player: Player.BLACK, position: { row: 0, col: 7 }, hasMoved: false },
      // 马
      { id: nextPieceId++, type: PieceType.KNIGHT, player: Player.BLACK, position: { row: 0, col: 1 } },
      { id: nextPieceId++, type: PieceType.KNIGHT, player: Player.BLACK, position: { row: 0, col: 6 } },
      // 象
      { id: nextPieceId++, type: PieceType.BISHOP, player: Player.BLACK, position: { row: 0, col: 2 } },
      { id: nextPieceId++, type: PieceType.BISHOP, player: Player.BLACK, position: { row: 0, col: 5 } },
      // 后
      { id: nextPieceId++, type: PieceType.QUEEN, player: Player.BLACK, position: { row: 0, col: 3 } },
      // 王
      { id: nextPieceId++, type: PieceType.KING, player: Player.BLACK, position: { row: 0, col: 4 }, hasMoved: false },
      // 兵
      ...Array(8).fill(0).map((_, i) => ({
        id: nextPieceId++,
        type: PieceType.PAWN,
        player: Player.BLACK,
        position: { row: 1, col: i },
      })),
    ];

    // 初始化白色棋子（下方）
    const whitePieces: Piece[] = [
      // 车
      { id: nextPieceId++, type: PieceType.ROOK, player: Player.WHITE, position: { row: 7, col: 0 }, hasMoved: false },
      { id: nextPieceId++, type: PieceType.ROOK, player: Player.WHITE, position: { row: 7, col: 7 }, hasMoved: false },
      // 马
      { id: nextPieceId++, type: PieceType.KNIGHT, player: Player.WHITE, position: { row: 7, col: 1 } },
      { id: nextPieceId++, type: PieceType.KNIGHT, player: Player.WHITE, position: { row: 7, col: 6 } },
      // 象
      { id: nextPieceId++, type: PieceType.BISHOP, player: Player.WHITE, position: { row: 7, col: 2 } },
      { id: nextPieceId++, type: PieceType.BISHOP, player: Player.WHITE, position: { row: 7, col: 5 } },
      // 后
      { id: nextPieceId++, type: PieceType.QUEEN, player: Player.WHITE, position: { row: 7, col: 3 } },
      // 王
      { id: nextPieceId++, type: PieceType.KING, player: Player.WHITE, position: { row: 7, col: 4 }, hasMoved: false },
      // 兵
      ...Array(8).fill(0).map((_, i) => ({
        id: nextPieceId++,
        type: PieceType.PAWN,
        player: Player.WHITE,
        position: { row: 6, col: i },
      })),
    ];

    pieces.value = [...blackPieces, ...whitePieces];
  }

  // ========== 移动逻辑 ==========

  /**
   * 获取指定棋子的有效移动
   */
  function getValidMoves(piece: Piece, checkForCheck: boolean = true): ValidMove[] {
    const moves: ValidMove[] = [];

    switch (piece.type) {
      case PieceType.PAWN:
        moves.push(...getPawnMoves(piece));
        break;
      case PieceType.ROOK:
        moves.push(...getRookMoves(piece));
        break;
      case PieceType.KNIGHT:
        moves.push(...getKnightMoves(piece));
        break;
      case PieceType.BISHOP:
        moves.push(...getBishopMoves(piece));
        break;
      case PieceType.QUEEN:
        moves.push(...getRookMoves(piece));
        moves.push(...getBishopMoves(piece));
        break;
      case PieceType.KING:
        moves.push(...getKingMoves(piece));
        break;
    }

    // 过滤掉会导致自己被将军的移动
    if (checkForCheck) {
      return moves.filter((move) => !wouldBeInCheck(piece, move));
    }

    return moves;
  }

  /**
   * 获取兵的移动
   */
  function getPawnMoves(piece: Piece): ValidMove[] {
    const moves: ValidMove[] = [];
    const direction = piece.player === Player.WHITE ? -1 : 1;
    const startRow = piece.player === Player.WHITE ? 6 : 1;

    // 前进一格
    const forward: Coord = { row: piece.position.row + direction, col: piece.position.col };
    if (isValidCoord(forward) && isEmptySquare(forward)) {
      moves.push({
        from: piece.position,
        to: forward,
        pieceType: PieceType.PAWN,
      });

      // 初始位置可以前进两格
      if (piece.position.row === startRow) {
        const doubleForward: Coord = { row: piece.position.row + direction * 2, col: piece.position.col };
        if (isValidCoord(doubleForward) && isEmptySquare(doubleForward)) {
          moves.push({
            from: piece.position,
            to: doubleForward,
            pieceType: PieceType.PAWN,
          });
        }
      }
    }

    // 斜向吃子
    const captureOffsets = [
      { row: direction, col: -1 },
      { row: direction, col: 1 },
    ];

    captureOffsets.forEach((offset) => {
      const captureCoord: Coord = {
        row: piece.position.row + offset.row,
        col: piece.position.col + offset.col,
      };

      if (isValidCoord(captureCoord)) {
        const targetPiece = getPieceAt(captureCoord);
        if (targetPiece && targetPiece.player !== piece.player) {
          moves.push({
            from: piece.position,
            to: captureCoord,
            pieceType: PieceType.PAWN,
            captured: targetPiece,
          });
        }

        // 吃过路兵
        if (enPassantTarget && coordEqual(captureCoord, enPassantTarget)) {
          const capturedPawnCoord: Coord = {
            row: piece.position.row,
            col: captureCoord.col,
          };
          const capturedPawn = getPieceAt(capturedPawnCoord);
          if (capturedPawn && capturedPawn.type === PieceType.PAWN && capturedPawn.player !== piece.player) {
            moves.push({
              from: piece.position,
              to: captureCoord,
              pieceType: PieceType.PAWN,
              captured: capturedPawn,
              specialMove: SpecialMove.EN_PASSANT,
            });
          }
        }
      }
    });

    // 兵升变
    moves.forEach((move) => {
      const promotionRow = piece.player === Player.WHITE ? 0 : 7;
      if (move.to.row === promotionRow) {
        move.specialMove = SpecialMove.PROMOTION;
        move.promotionPiece = PieceType.QUEEN; // 默认升变为后
      }
    });

    return moves;
  }

  /**
   * 获取车的移动
   */
  function getRookMoves(piece: Piece): ValidMove[] {
    const moves: ValidMove[] = [];
    const directions = [
      { row: 0, col: 1 },
      { row: 0, col: -1 },
      { row: 1, col: 0 },
      { row: -1, col: 0 },
    ];

    directions.forEach((dir) => {
      let current: Coord = { row: piece.position.row + dir.row, col: piece.position.col + dir.col };

      while (isValidCoord(current)) {
        const targetPiece = getPieceAt(current);

        if (isEmptySquare(current)) {
          moves.push({
            from: piece.position,
            to: current,
            pieceType: PieceType.ROOK,
          });
        } else {
          if (targetPiece && targetPiece.player !== piece.player) {
            moves.push({
              from: piece.position,
              to: current,
              pieceType: PieceType.ROOK,
              captured: targetPiece,
            });
          }
          break;
        }

        current = { row: current.row + dir.row, col: current.col + dir.col };
      }
    });

    return moves;
  }

  /**
   * 获取马的移动
   */
  function getKnightMoves(piece: Piece): ValidMove[] {
    const moves: ValidMove[] = [];
    const offsets = [
      { row: -2, col: -1 },
      { row: -2, col: 1 },
      { row: -1, col: -2 },
      { row: -1, col: 2 },
      { row: 1, col: -2 },
      { row: 1, col: 2 },
      { row: 2, col: -1 },
      { row: 2, col: 1 },
    ];

    offsets.forEach((offset) => {
      const target: Coord = {
        row: piece.position.row + offset.row,
        col: piece.position.col + offset.col,
      };

      if (isValidCoord(target)) {
        const targetPiece = getPieceAt(target);
        if (isEmptySquare(target) || (targetPiece && targetPiece.player !== piece.player)) {
          moves.push({
            from: piece.position,
            to: target,
            pieceType: PieceType.KNIGHT,
            captured: targetPiece || undefined,
          });
        }
      }
    });

    return moves;
  }

  /**
   * 获取象的移动
   */
  function getBishopMoves(piece: Piece): ValidMove[] {
    const moves: ValidMove[] = [];
    const directions = [
      { row: 1, col: 1 },
      { row: 1, col: -1 },
      { row: -1, col: 1 },
      { row: -1, col: -1 },
    ];

    directions.forEach((dir) => {
      let current: Coord = { row: piece.position.row + dir.row, col: piece.position.col + dir.col };

      while (isValidCoord(current)) {
        const targetPiece = getPieceAt(current);

        if (isEmptySquare(current)) {
          moves.push({
            from: piece.position,
            to: current,
            pieceType: PieceType.BISHOP,
          });
        } else {
          if (targetPiece && targetPiece.player !== piece.player) {
            moves.push({
              from: piece.position,
              to: current,
              pieceType: PieceType.BISHOP,
              captured: targetPiece,
            });
          }
          break;
        }

        current = { row: current.row + dir.row, col: current.col + dir.col };
      }
    });

    return moves;
  }

  /**
   * 获取王的移动
   */
  function getKingMoves(piece: Piece): ValidMove[] {
    const moves: ValidMove[] = [];
    const offsets = [
      { row: -1, col: -1 },
      { row: -1, col: 0 },
      { row: -1, col: 1 },
      { row: 0, col: -1 },
      { row: 0, col: 1 },
      { row: 1, col: -1 },
      { row: 1, col: 0 },
      { row: 1, col: 1 },
    ];

    offsets.forEach((offset) => {
      const target: Coord = {
        row: piece.position.row + offset.row,
        col: piece.position.col + offset.col,
      };

      if (isValidCoord(target)) {
        const targetPiece = getPieceAt(target);
        if (isEmptySquare(target) || (targetPiece && targetPiece.player !== piece.player)) {
          moves.push({
            from: piece.position,
            to: target,
            pieceType: PieceType.KING,
            captured: targetPiece || undefined,
          });
        }
      }
    });

    // 王车易位
    if (!piece.hasMoved && !isInCheck.value) {
      // 短易位（王侧）
      const rookPos: Coord = { row: piece.position.row, col: 7 };
      const rook = getPieceAt(rookPos);
      if (rook && rook.type === PieceType.ROOK && !rook.hasMoved) {
        const squaresClear = [
          { row: piece.position.row, col: 5 },
          { row: piece.position.row, col: 6 },
        ].every((sq) => isEmptySquare(sq));

        if (squaresClear && !isSquareAttacked({ row: piece.position.row, col: 5 }, piece.player)) {
          moves.push({
            from: piece.position,
            to: { row: piece.position.row, col: 6 },
            pieceType: PieceType.KING,
            specialMove: SpecialMove.CASTLING_KINGSIDE,
          });
        }
      }

      // 长易位（后侧）
      const queenRookPos: Coord = { row: piece.position.row, col: 0 };
      const queenRook = getPieceAt(queenRookPos);
      if (queenRook && queenRook.type === PieceType.ROOK && !queenRook.hasMoved) {
        const squaresClear = [
          { row: piece.position.row, col: 1 },
          { row: piece.position.row, col: 2 },
          { row: piece.position.row, col: 3 },
        ].every((sq) => isEmptySquare(sq));

        if (squaresClear && !isSquareAttacked({ row: piece.position.row, col: 3 }, piece.player)) {
          moves.push({
            from: piece.position,
            to: { row: piece.position.row, col: 2 },
            pieceType: PieceType.KING,
            specialMove: SpecialMove.CASTLING_QUEENSIDE,
          });
        }
      }
    }

    return moves;
  }

  /**
   * 检查移动后是否会被将军
   */
  function wouldBeInCheck(piece: Piece, move: ValidMove): boolean {
    // 模拟移动
    const oldPosition = { ...piece.position };

    // 临时执行移动
    piece.position = move.to;

    // 检查王是否被攻击
    const king = pieces.value.find((p) => p.type === PieceType.KING && p.player === piece.player);
    let result = false;

    if (king) {
      result = isSquareAttacked(king.position, piece.player);
    }

    // 恢复位置
    piece.position = oldPosition;

    return result;
  }

  /**
   * 检查某个格子是否被攻击
   */
  function isSquareAttacked(coord: Coord, defenderPlayer: Player): boolean {
    const attackerPlayer = defenderPlayer === Player.WHITE ? Player.BLACK : Player.WHITE;
    const attackerPieces = pieces.value.filter((p) => p.player === attackerPlayer);

    return attackerPieces.some((piece) => {
      const moves = getValidMoves(piece, false);
      return moves.some((move) => coordEqual(move.to, coord));
    });
  }

  /**
   * 检查玩家是否被将军
   */
  function checkForCheck(player: Player): boolean {
    const king = pieces.value.find((p) => p.type === PieceType.KING && p.player === player);
    if (!king) return false;

    return isSquareAttacked(king.position, player);
  }

  /**
   * 检查是否有合法移动
   */
  function hasLegalMoves(player: Player): boolean {
    const playerPieces = pieces.value.filter((p) => p.player === player);
    return playerPieces.some((piece) => {
      return getValidMoves(piece).length > 0;
    });
  }

  // ========== 游戏控制 ==========

  /**
   * 选择棋子
   */
  function selectPiece(piece: Piece): void {
    if (gameState.value !== GameState.PLAYING) return;
    if (piece.player !== currentPlayer.value) return;

    selectedPiece.value = piece;
    validMoves.value = getValidMoves(piece);
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
  function movePiece(move: ValidMove, promotionPiece?: PieceType): boolean {
    if (!selectedPiece.value) return false;

    const piece = selectedPiece.value;

    // 处理吃过路兵
    if (move.specialMove === SpecialMove.EN_PASSANT && move.captured) {
      const capturedIndex = pieces.value.findIndex((p) => p.id === move.captured!.id);
      if (capturedIndex !== -1) {
        pieces.value.splice(capturedIndex, 1);
      }
    }

    // 处理王车易位
    if (move.specialMove === SpecialMove.CASTLING_KINGSIDE) {
      const rookPos: Coord = { row: piece.position.row, col: 7 };
      const rook = getPieceAt(rookPos);
      if (rook) {
        rook.position = { row: piece.position.row, col: 5 };
        rook.hasMoved = true;
      }
    } else if (move.specialMove === SpecialMove.CASTLING_QUEENSIDE) {
      const rookPos: Coord = { row: piece.position.row, col: 0 };
      const rook = getPieceAt(rookPos);
      if (rook) {
        rook.position = { row: piece.position.row, col: 3 };
        rook.hasMoved = true;
      }
    }

    // 移动棋子
    piece.position = move.to;
    piece.hasMoved = true;

    // 处理吃子
    if (move.captured && move.specialMove !== SpecialMove.EN_PASSANT) {
      const capturedIndex = pieces.value.findIndex((p) => p.id === move.captured!.id);
      if (capturedIndex !== -1) {
        pieces.value.splice(capturedIndex, 1);
        audioService.play(SoundType.MERGE);
        vibrationService.vibrate(VibrationType.MERGE);
      } else {
        audioService.play(SoundType.MOVE);
        vibrationService.vibrate(VibrationType.MOVE);
      }
    } else {
      audioService.play(SoundType.MOVE);
      vibrationService.vibrate(VibrationType.MOVE);
    }

    // 处理兵升变
    if (move.specialMove === SpecialMove.PROMOTION) {
      piece.type = promotionPiece || PieceType.QUEEN;
      audioService.play(SoundType.WIN);
      vibrationService.vibrate(VibrationType.WIN);
    }

    // 更新吃过路兵目标
    if (move.pieceType === PieceType.PAWN && Math.abs(move.to.row - move.from.row) === 2) {
      enPassantTarget = {
        row: (move.from.row + move.to.row) / 2,
        col: move.from.col,
      };
    } else {
      enPassantTarget = null;
    }

    // 清除选择
    deselectPiece();

    // 检查游戏状态
    checkGameState();

    return true;
  }

  /**
   * 检查游戏状态
   */
  function checkGameState(): void {
    // 检查当前玩家是否被将军
    const inCheck = checkForCheck(currentPlayer.value);
    isInCheck.value = inCheck;

    // 检查是否有合法移动
    const hasValidMoves = hasLegalMoves(currentPlayer.value);

    if (!hasValidMoves) {
      if (inCheck) {
        // 将死
        gameState.value = currentPlayer.value === Player.WHITE ? GameState.BLACK_WINS : GameState.WHITE_WINS;
        updateWinCount(currentPlayer.value === Player.WHITE ? Player.BLACK : Player.WHITE);
        audioService.play(SoundType.WIN);
        vibrationService.vibrate(VibrationType.WIN);
      } else {
        // 逼和
        gameState.value = GameState.STALEMATE;
        audioService.play(SoundType.DRAW);
        vibrationService.vibrate(VibrationType.DRAW);
      }
    } else if (inCheck) {
      gameState.value = GameState.CHECKMATE;
      audioService.play(SoundType.PLACE_BLACK);
    }

    // 切换玩家
    if (gameState.value === GameState.PLAYING || gameState.value === GameState.CHECKMATE) {
      currentPlayer.value = currentPlayer.value === Player.WHITE ? Player.BLACK : Player.WHITE;

      // 如果是人机模式且轮到 AI，触发AI下棋
      if (gameMode.value === GameMode.PVE && currentPlayer.value === aiPlayer.value) {
        setTimeout(() => {
          aiMove();
        }, 500);
      }
    }
  }

  /**
   * 更新获胜次数
   */
  function updateWinCount(player: Player): void {
    if (player === Player.WHITE) {
      whiteWins.value++;
    } else {
      blackWins.value++;
    }
  }

  // ========== 计算属性 ==========

  /**
   * 游戏状态文本
   */
  const statusText = computed((): string => {
    if (gameState.value === GameState.WHITE_WINS) return '白方获胜！';
    if (gameState.value === GameState.BLACK_WINS) return '黑方获胜！';
    if (gameState.value === GameState.DRAW) return '平局！';
    if (gameState.value === GameState.STALEMATE) return '逼和！';
    if (gameState.value === GameState.CHECKMATE) return '将军！';

    if (gameMode.value === GameMode.PVE) {
      return currentPlayer.value === aiPlayer.value ? 'AI思考中...' : '你的回合';
    }

    const playerName = PLAYER_NAMES[currentPlayer.value];
    return `${playerName}回合`;
  });

  // ========== AI算法 ==========

  /**
   * 简单的棋盘评估
   */
  function evaluateBoard(): number {
    const pieceValues: Record<PieceType, number> = {
      [PieceType.PAWN]: 1,
      [PieceType.KNIGHT]: 3,
      [PieceType.BISHOP]: 3,
      [PieceType.ROOK]: 5,
      [PieceType.QUEEN]: 9,
      [PieceType.KING]: 100,
    };

    let score = 0;

    pieces.value.forEach((piece) => {
      const value = pieceValues[piece.type];
      if (piece.player === aiPlayer.value) {
        score += value;
      } else {
        score -= value;
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
    const playerPieces = pieces.value.filter((p) => p.player === player);
    let bestMove: ValidMove | null = null;
    let bestScore = -Infinity;

    playerPieces.forEach((piece) => {
      const moves = getValidMoves(piece);

      moves.forEach((move) => {
        // 模拟移动
        const capturedPiece = move.captured;
        const oldPosition = { ...piece.position };
        const oldType = piece.type;

        piece.position = move.to;

        // 处理兵升变
        if (move.specialMove === SpecialMove.PROMOTION) {
          piece.type = PieceType.QUEEN;
        }

        if (capturedPiece) {
          const capturedIndex = pieces.value.findIndex((p) => p.id === capturedPiece!.id);
          if (capturedIndex !== -1) {
            pieces.value.splice(capturedIndex, 1);
          }
        }

        const score = evaluateBoard();

        // 恢复移动
        piece.position = oldPosition;
        piece.type = oldType;
        if (capturedPiece) {
          pieces.value.push(capturedPiece);
        }

        // 添加随机性
        const randomFactor = aiDifficulty.value === AIDifficulty.EASY ? Math.random() * 2 - 1 : 0;

        if (score + randomFactor > bestScore) {
          bestScore = score + randomFactor;
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
          // 如果是兵升变，选择升变为后
          const promotionPiece = move.specialMove === SpecialMove.PROMOTION ? PieceType.QUEEN : undefined;
          movePiece(move, promotionPiece);
        }, 300);
      }
    }
  }

  // ========== 持久化 ==========

  /**
   * 加载游戏状态
   */
  function loadGameState(): void {
    const data = persistenceService.loadChessGame();

    // 加载统计数据
    whiteWins.value = data.stats.whiteWins;
    blackWins.value = data.stats.blackWins;

    // 初始化新游戏
    initBoard();
  }

  /**
   * 清除游戏状态
   */
  function clearGameState(): void {
    const data = persistenceService.loadChessGame();
    persistenceService.saveChessGame({
      stats: data.stats,
      gameState: null,
    });
  }

  // 监听数据变化，自动保存
  watch([whiteWins, blackWins], () => {
    const data = persistenceService.loadChessGame();
    persistenceService.saveChessGame({
      stats: {
        whiteWins: whiteWins.value,
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
    currentPlayer.value = Player.WHITE;
    deselectPiece();
    isInCheck.value = false;
  }

  /**
   * 设置游戏模式
   */
  function setGameMode(mode: GameMode): void {
    gameMode.value = mode;
    startNewGame();

    // 如果是人机模式，设置AI
    if (mode === GameMode.PVE) {
      aiPlayer.value = Player.BLACK;
    } else {
      aiPlayer.value = null;
    }
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
    whiteWins.value = 0;
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
    isInCheck,
    whiteWins,
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
  };
}