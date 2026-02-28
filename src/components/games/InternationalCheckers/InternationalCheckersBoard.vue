<template>
  <div class="international-checkers-game">
    <div class="game-header">
      <div class="score-info">
        <div class="score-item">
          <span class="score-label score-label--red">红色</span>
          <span class="score-value">{{ redWins }}</span>
        </div>
        <div class="score-item">
          <span class="score-label score-label--black">黑色</span>
          <span class="score-value">{{ blackWins }}</span>
        </div>
      </div>
      <div class="status-text">{{ statusText }}</div>
    </div>

    <div class="game-board">
      <div class="board-container">
        <div class="board">
          <!-- 棋盘格子 -->
          <div
            v-for="row in BOARD_SIZE"
            :key="`row-${row}`"
            class="board-row"
          >
            <div
              v-for="col in BOARD_SIZE"
              :key="`cell-${row}-${col}`"
              class="board-cell"
              :class="{
                'board-cell--dark': isDarkSquare({ row: row - 1, col: col - 1 }),
                'board-cell--light': !isDarkSquare({ row: row - 1, col: col - 1 }),
              }"
              @click="handleCellClick(row - 1, col - 1)"
            >
              <!-- 有效移动提示 -->
              <div
                v-if="isValidMoveTarget({ row: row - 1, col: col - 1 })"
                class="valid-move-hint"
                @click.stop="handleValidMoveClick({ row: row - 1, col: col - 1 })"
              />

              <!-- 棋子 -->
              <div
                v-if="getPieceAt({ row: row - 1, col: col - 1 })"
                class="piece"
                :class="{
                  'piece--red': getPieceAt({ row: row - 1, col: col - 1 })?.player === Player.RED,
                  'piece--black': getPieceAt({ row: row - 1, col: col - 1 })?.player === Player.BLACK,
                  'piece--king': getPieceAt({ row: row - 1, col: col - 1 })?.type === PieceType.KING,
                  'piece--selected': selectedPiece?.id === getPieceAt({ row: row - 1, col: col - 1 })?.id,
                }"
                @click.stop="handlePieceClick(getPieceAt({ row: row - 1, col: col - 1 })!)"
              >
                <span v-if="getPieceAt({ row: row - 1, col: col - 1 })?.type === PieceType.KING" class="king-crown">👑</span>
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
          <span
            class="current-player-indicator"
            :style="{ backgroundColor: PLAYER_COLORS[currentPlayer] }"
          ></span>
          <span class="current-player-name">{{ PLAYER_NAMES[currentPlayer] }}</span>
        </div>
        <div v-if="isChainJumping" class="chain-jump-hint">
          ⚠️ 连续跳跃中，请继续跳跃
        </div>
      </div>
    </div>
  </div>

  <!-- 游戏结束遮罩 -->
  <div v-if="gameState !== GameState.PLAYING" class="game-over-overlay">
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
 * 国际跳棋游戏棋盘组件
 * 显示游戏棋盘和棋子
 */

import { useInternationalCheckersGame } from '@/composables/useInternationalCheckersGame';
import {
  BOARD_SIZE,
  Player,
  GameState,
  PieceType,
  PLAYER_COLORS,
  PLAYER_NAMES,
} from '@/constants/internationalCheckersConstants';

// 使用游戏逻辑
const {
  currentPlayer,
  gameState,
  redWins,
  blackWins,
  statusText,
  selectedPiece,
  validMoves,
  isChainJumping,
  chainJumpPiece,
  selectPiece,
  deselectPiece,
  movePiece,
  startNewGame,
  resetAllStats,
  getPieceAt,
  coordEqual,
  isDarkSquare,
} = useInternationalCheckersGame();

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
      movePiece(move);
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
    movePiece(move);
  }
}

/**
 * 处理棋子点击
 */
function handlePieceClick(piece: any): void {
  if (gameState.value !== GameState.PLAYING) return;

  // 如果正在进行连续跳跃，只能选择正在跳跃的棋子
  if (isChainJumping.value && chainJumpPiece.value?.id !== piece.id) {
    // 给用户提示：必须继续跳跃
    return;
  }

  if (selectedPiece.value?.id === piece.id) {
    deselectPiece();
  } else {
    selectPiece(piece);
  }
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
 * 国际跳棋游戏棋盘组件样式
 */

.international-checkers-game {
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

.score-label--red {
  color: #333333;
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
  background-color: var(--color-white);
  border: var(--border-width-medium) solid var(--color-black);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.board-row {
  flex: 1;
  display: flex;
}

.board-cell {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.board-cell--dark {
  background-color: #8B4513;
}

.board-cell--light {
  background-color: #F5F5DC;
}

.valid-move-hint {
  position: absolute;
  width: 60%;
  height: 60%;
  background-color: rgba(0, 255, 0, 0.3);
  border-radius: 50%;
  cursor: pointer;
  animation: pulse 1.5s ease-in-out infinite;
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
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.piece--red {
  background-color: #FFFFFF;
  border: 2px solid rgba(0, 0, 0, 0.5);
}

.piece--black {
  background-color: #000;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.piece--selected {
  transform: scale(1.1);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  border-width: 3px;
}

.piece--king {
  animation: glow 2s ease-in-out infinite;
}

@keyframes glow {
  0%, 100% {
    box-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
  }
  50% {
    box-shadow: 0 0 15px rgba(255, 215, 0, 0.8);
  }
}

.king-crown {
  font-size: 1.2rem;
  user-select: none;
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

.current-player-indicator {
  width: 1.2rem;
  height: 1.2rem;
  border-radius: 50%;
  border: 2px solid rgba(0, 0, 0, 0.3);
}

.current-player-name {
  color: var(--color-black);
}

.chain-jump-hint {
  font-size: var(--font-size-sm);
  color: #f59e0b;
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

/* 游戏结束遮罩 */
.game-over-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.8);
  animation: fadeIn 0.3s ease;
  z-index: 100;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
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

.new-game-button,
.reset-all-button {
  padding: var(--spacing-3) var(--spacing-6);
  background-color: var(--color-black);
  color: var(--color-white);
  font-size: var(--font-size-base);
  font-weight: 600;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
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

.new-game-button:active,
.reset-all-button:active {
  transform: translateY(0);
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

  .game-over-buttons {
    flex-direction: column;
  }
}
</style>