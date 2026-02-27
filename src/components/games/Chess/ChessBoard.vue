<template>
  <div class="chess-game">
    <div class="game-header">
      <div class="score-info">
        <div class="score-item">
          <span class="score-label score-label--white">白方</span>
          <span class="score-value">{{ whiteWins }}</span>
        </div>
        <div class="score-item">
          <span class="score-label score-label--black">黑方</span>
          <span class="score-value">{{ blackWins }}</span>
        </div>
      </div>
      <div class="status-text">{{ statusText }}</div>
    </div>

    <div class="game-board">
      <div class="board-container">
        <div class="board">
          <!-- 棋盘行列标签 -->
          <div class="board-labels-row">
            <div v-for="col in BOARD_SIZE" :key="`label-col-${col}`" class="board-label">
              {{ String.fromCharCode(64 + col) }}
            </div>
          </div>

          <!-- 棋盘格子 -->
          <div
            v-for="row in BOARD_SIZE"
            :key="`row-${row}`"
            class="board-row"
          >
            <div class="board-label board-label--row">{{ BOARD_SIZE - row + 1 }}</div>
            <div
              v-for="col in BOARD_SIZE"
              :key="`cell-${row}-${col}`"
              class="board-cell"
              :class="{
                'board-cell--white': (row + col) % 2 === 0,
                'board-cell--black': (row + col) % 2 === 1,
              }"
              @click="handleCellClick(BOARD_SIZE - row, col - 1)"
            >
              <!-- 有效移动提示 -->
              <div
                v-if="isValidMoveTarget({ row: BOARD_SIZE - row, col: col - 1 })"
                class="valid-move-hint"
                @click.stop="handleValidMoveClick({ row: BOARD_SIZE - row, col: col - 1 })"
              />

              <!-- 棋子 -->
              <div
                v-if="getPieceAt({ row: BOARD_SIZE - row, col: col - 1 })"
                class="piece"
                :class="{
                  'piece--white': getPieceAt({ row: BOARD_SIZE - row, col: col - 1 })?.player === Player.WHITE,
                  'piece--black': getPieceAt({ row: BOARD_SIZE - row, col: col - 1 })?.player === Player.BLACK,
                  'piece--selected': selectedPiece?.id === getPieceAt({ row: BOARD_SIZE - row, col: col - 1 })?.id,
                }"
                @click.stop="handlePieceClick(getPieceAt({ row: BOARD_SIZE - row, col: col - 1 })!)"
              >
                {{ PIECE_SYMBOLS[getPieceAt({ row: BOARD_SIZE - row, col: col - 1 })!.player][getPieceAt({ row: BOARD_SIZE - row, col: col - 1 })!.type] }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="game-controls">
      <div class="control-info">
        <div class="current-player">
          <span class="current-player-label">当前玩家：</span>
          <span class="current-player-name">{{ PLAYER_NAMES[currentPlayer] }}</span>
        </div>
        <div v-if="isInCheck" class="check-warning">
          ⚠️ 将军警告！
        </div>
      </div>
    </div>

    <!-- 兵升变选择弹窗 -->
    <div v-if="showPromotionDialog" class="promotion-dialog">
      <div class="promotion-content">
        <div class="promotion-title">选择升变棋子</div>
        <div class="promotion-options">
          <button
            v-for="pieceType in promotionOptions"
            :key="pieceType"
            class="promotion-button"
            @click="handlePromotionSelect(pieceType)"
          >
            {{ PIECE_SYMBOLS[currentPlayer][pieceType] }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- 游戏结束遮罩 -->
  <div v-if="gameState !== GameState.PLAYING && gameState !== GameState.CHECKMATE" class="game-over-overlay">
    <div class="game-over-content">
      <div class="game-over-icon">🎉</div>
      <div class="game-over-title">{{ statusText }}</div>
      <div class="game-over-buttons">
        <button class="new-game-button" @click="handleNewGame">
          新游戏
        </button>
        <button class="reset-all-button" @click="handleResetAll">
          重置统计
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 国际象棋游戏棋盘组件
 * 显示游戏棋盘和棋子
 */

import { ref } from 'vue';
import { useChessGame } from '@/composables/useChessGame';
import {
  BOARD_SIZE,
  Player,
  GameState,
  PieceType,
  PIECE_SYMBOLS,
  PLAYER_NAMES,
} from '@/constants/chessConstants';

// 使用游戏逻辑
const {
  currentPlayer,
  gameState,
  whiteWins,
  blackWins,
  statusText,
  selectedPiece,
  validMoves,
  isInCheck,
  selectPiece,
  deselectPiece,
  movePiece,
  startNewGame,
  resetAllStats,
  getPieceAt,
  coordEqual,
} = useChessGame();

/**
 * 是否显示升变选择弹窗
 */
const showPromotionDialog = ref<boolean>(false);

/**
 * 待执行的升变移动
 */
const pendingPromotionMove = ref<any>(null);

/**
 * 升变选项
 */
const promotionOptions = [PieceType.QUEEN, PieceType.ROOK, PieceType.BISHOP, PieceType.KNIGHT];

/**
 * 检查坐标是否是有效移动的目标
 */
function isValidMoveTarget(coord: { row: number; col: number }): boolean {
  return validMoves.value.some((move) => coordEqual(move.to, coord));
}

/**
 * 处理单元格点击
 */
function handleCellClick(row: number, col: number): void {
  const coord = { row, col };

  // 如果点击的是有效移动目标，执行移动
  if (isValidMoveTarget(coord)) {
    const move = validMoves.value.find((m) => coordEqual(m.to, coord));
    if (move) {
      // 如果是兵升变，显示选择弹窗
      if (move.specialMove === 'promotion') {
        pendingPromotionMove.value = move;
        showPromotionDialog.value = true;
      } else {
        movePiece(move);
      }
    }
  } else {
    // 否则取消选择
    deselectPiece();
  }
}

/**
 * 处理有效移动点击
 */
function handleValidMoveClick(coord: { row: number; col: number }): void {
  const move = validMoves.value.find((m) => coordEqual(m.to, coord));
  if (move) {
    if (move.specialMove === 'promotion') {
      pendingPromotionMove.value = move;
      showPromotionDialog.value = true;
    } else {
      movePiece(move);
    }
  }
}

/**
 * 处理棋子点击
 */
function handlePieceClick(piece: any): void {
  if (gameState.value !== GameState.PLAYING && gameState.value !== GameState.CHECKMATE) return;

  if (selectedPiece.value?.id === piece.id) {
    deselectPiece();
  } else {
    selectPiece(piece);
  }
}

/**
 * 处理升变选择
 */
function handlePromotionSelect(pieceType: PieceType): void {
  if (pendingPromotionMove.value) {
    movePiece(pendingPromotionMove.value, pieceType);
    pendingPromotionMove.value = null;
  }
  showPromotionDialog.value = false;
}

/**
 * 处理新游戏
 */
function handleNewGame(): void {
  startNewGame();
}

/**
 * 处理重置统计
 */
function handleResetAll(): void {
  resetAllStats();
}
</script>

<style scoped>
/**
 * 国际象棋游戏棋盘组件样式
 */

.chess-game {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
}

/* 游戏头部 */
.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-4);
  background-color: var(--color-gray-100);
  border-radius: var(--radius-lg);
}

.score-info {
  display: flex;
  gap: var(--spacing-6);
}

.score-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.score-label {
  font-size: var(--font-size-xs);
  color: var(--color-gray-500);
  font-weight: 600;
}

.score-label--white {
  color: #fff;
  text-shadow: 0 0 2px #000;
}

.score-label--black {
  color: #000;
}

.score-value {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-black);
}

.status-text {
  font-size: var(--font-size-base);
  color: var(--color-gray-600);
  font-weight: 600;
}

/* 游戏棋盘 */
.game-board {
  display: flex;
  justify-content: center;
}

.board-container {
  width: 100%;
  max-width: 500px;
  aspect-ratio: 1 / 1;
}

.board {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.board-labels-row {
  display: flex;
  background-color: var(--color-gray-100);
}

.board-label {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-gray-600);
  padding: var(--spacing-1);
}

.board-row {
  display: flex;
}

.board-cell {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast), box-shadow 0.3s ease;
  aspect-ratio: 1 / 1;
}

.board-cell--white {
  background-color: #f0d9b5;
}

.board-cell--black {
  background-color: #b58863;
}

.valid-move-hint {
  position: relative;
  box-shadow: 0 0 8px rgba(0, 255, 0, 0.5);
  position: absolute;
  width: 30%;
  height: 30%;
  background-color: rgba(0, 255, 0, 0.3);
  border-radius: 50%;
  cursor: pointer;
  animation: pulse 1.5s ease-in-out infinite;
}


/* 棋子出现动画 */
@keyframes pieceAppear {
  from {
    opacity: 0;
    transform: scale(0.5) rotate(-10deg);
  }
  to {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

/* 棋子选中动画 */
@keyframes pieceSelect {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1.15);
  }
}

/* 棋子吃子动画 */
@keyframes pieceCapture {
  0% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.3) rotate(180deg);
  }
  100% {
    opacity: 0;
    transform: scale(0) rotate(360deg);
  }
}

/* 按钮涟漪动画 */
@keyframes buttonRipple {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(4);
    opacity: 0;
  }
}

/* 弹入动画 */
@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
  }
}

/* 图标脉冲动画 */
@keyframes iconPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}
@keyframes pulse {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.6;
  }
}

/* 棋子 */
.piece {
  position: relative;
  width: 80%;
  height: 80%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  transition: all var(--transition-fast), box-shadow 0.3s ease;
  cursor: pointer;
  user-select: none;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.piece--selected {
  transform: scale(1.15);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  background-color: rgba(255, 255, 0, 0.3);
}

/* 游戏控制 */
.game-controls {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  padding: var(--spacing-4);
  background-color: var(--color-gray-100);
  border-radius: var(--radius-lg);
}

.control-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-2);
}

.current-player {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-base);
  font-weight: 600;
}

.current-player-label {
  color: var(--color-gray-600);
}

.current-player-name {
  color: var(--color-black);
}

.check-warning {
  font-size: var(--font-size-sm);
  color: #dc2626;
  font-weight: 600;
  animation: blink 1s ease-in-out infinite;
}

@keyframes blink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* 兵升变选择弹窗 */
.promotion-dialog {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.8);
  animation: bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  z-index: 200;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.promotion-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-4);
  padding: var(--spacing-8);
  background-color: var(--color-white);
  border-radius: var(--radius-xl);
  text-align: center;
}

.promotion-title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-black);
}

.promotion-options {
  display: flex;
  gap: var(--spacing-3);
}

.promotion-button {
  width: 4rem;
  height: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  background-color: var(--color-gray-100);
  border: var(--border-width-medium) solid var(--color-gray-200);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast), box-shadow 0.3s ease;
}

.promotion-button:hover {
  background-color: var(--color-gray-200);
  border-color: var(--color-black);
  transform: translateY(-2px);
}

/* 游戏结束遮罩 */
.game-over-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.8);
  animation: bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  z-index: 100;
}

.game-over-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-4);
  padding: var(--spacing-8);
  background-color: var(--color-white);
  border-radius: var(--radius-xl);
  text-align: center;
}

.game-over-icon {
  animation: iconPulse 0.6s ease-in-out infinite alternate;
  font-size: 4rem;
}

.game-over-title {
  font-size: var(--font-size-2xl);
  font-weight: 800;
  color: var(--color-black);
}

.game-over-buttons {
  display: flex;
  gap: var(--spacing-3);
}

.new-game-button {
  position: relative;
  overflow: hidden;
}

.reset-all-button,
.reset-all-button {
  padding: var(--spacing-3) var(--spacing-6);
  background-color: var(--color-black);
  color: var(--color-white);
  font-size: var(--font-size-base);
  font-weight: 600;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast), box-shadow 0.3s ease;
  border: none;
  cursor: pointer;
}

.reset-all-button {
  background-color: var(--color-white);
  color: var(--color-black);
  border: var(--border-width-thin) solid var(--color-gray-300);
}

.new-game-button:hover {
  background-color: var(--color-gray-800);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.reset-all-button:hover {
  background-color: var(--color-gray-100);
  border-color: var(--color-black);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* 响应式设计 */
@media (max-width: 640px) {
  .game-header {
    padding: var(--spacing-3);
    gap: var(--spacing-3);
  }

  .score-info {
    gap: var(--spacing-4);
  }

  .score-value {
    font-size: var(--font-size-lg);
  }

  .board-container {
    max-width: 100%;
  }

  .piece {
    font-size: 2rem;
  }

  .game-over-buttons {
    flex-direction: column;
  }
}
</style>