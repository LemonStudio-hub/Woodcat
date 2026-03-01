<template>
  <div class="go-game">
    <div class="game-header">
      <div class="score-info">
        <div class="score-item">
          <span class="score-label score-label--black">黑方</span>
          <span class="score-value">提子: {{ blackCaptures }}</span>
        </div>
        <div class="score-item">
          <span class="score-label score-label--white">白方</span>
          <span class="score-value">提子: {{ whiteCaptures }}</span>
        </div>
      </div>
      <div class="status-text">{{ statusText }}</div>
    </div>

    <div class="game-board">
      <div class="board-container">
        <div class="board">
          <!-- 棋盘网格 -->
          <div
            v-for="row in BOARD_SIZE"
            :key="`row-${row}`"
            class="board-row"
          >
            <div
              v-for="col in BOARD_SIZE"
              :key="`cell-${row}-${col}`"
              class="board-cell"
              @click="handleCellClick(row - 1, col - 1)"
            >
              <!-- 棋盘星位点 -->
              <div
                v-if="isStarPoint(row - 1, col - 1)"
                class="star-point"
              ></div>

              <!-- 棋子 -->
              <div
                v-if="getStoneAt({ row: row - 1, col: col - 1 }) !== Player.EMPTY"
                class="stone"
                :class="{
                  'stone--black': getStoneAt({ row: row - 1, col: col - 1 }) === Player.BLACK,
                  'stone--white': getStoneAt({ row: row - 1, col: col - 1 }) === Player.WHITE,
                  'stone--last': isLastMove(row - 1, col - 1),
                }"
              ></div>
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
        <div class="control-buttons">
          <button class="resign-button" @click="handleResign">
            认输
          </button>
          <button class="new-game-button" @click="handleNewGame">
            新游戏
          </button>
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 围棋游戏棋盘组件
 * 显示游戏棋盘和棋子
 */

import { useGoGame } from '@/composables/useGoGame';
import {
  BOARD_SIZE,
  Player,
  GameState,
  PLAYER_COLORS,
  PLAYER_NAMES,
} from '@/constants/goConstants';

// 使用游戏逻辑
const {
  board,
  currentPlayer,
  gameState,
  blackCaptures,
  whiteCaptures,
  statusText,
  placeStone,
  resign,
  startNewGame,
  getStoneAt,
} = useGoGame();

/**
 * 检查是否是星位点
 */
function isStarPoint(row: number, col: number): boolean {
  const starPoints = [
    { row: 3, col: 3 },
    { row: 3, col: 9 },
    { row: 3, col: 15 },
    { row: 9, col: 3 },
    { row: 9, col: 9 },
    { row: 9, col: 15 },
    { row: 15, col: 3 },
    { row: 15, col: 9 },
    { row: 15, col: 15 },
  ];

  return starPoints.some((point) => point.row === row && point.col === col);
}

/**
 * 检查是否是最后一步
 */
function isLastMove(row: number, col: number): boolean {
  // 可以添加逻辑来标记最后一步
  return false;
}

/**
 * 处理棋盘点击
 */
function handleCellClick(row: number, col: number): void {
  if (gameState.value !== GameState.PLAYING) return;

  placeStone({ row, col });
}

/**
 * 处理认输
 */
function handleResign(): void {
  if (gameState.value !== GameState.PLAYING) return;
  resign();
}

/**
 * 处理新游戏
 */
function handleNewGame(): void {
  startNewGame();
}
</script>

<style scoped>
/**
 * 围棋游戏棋盘组件样式
 */

.go-game {
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

.score-label--black {
  color: #000;
}

.score-label--white {
  color: #666;
}

.score-value {
  font-size: var(--font-size-base);
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
  max-width: 600px;
  aspect-ratio: 1 / 1;
}

.board {
  width: 100%;
  height: 100%;
  background-color: #DEB887;
  border: var(--border-width-medium) solid #8B4513;
  border-radius: var(--radius-md);
  padding: var(--spacing-2);
  display: flex;
  flex-direction: column;
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
  position: relative;
}

/* 棋盘线（使用伪元素） */
.board-cell::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background-color: #000;
  z-index: 0;
}

.board-cell::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 1px;
  background-color: #000;
  z-index: 0;
}

/* 星位点 */
.star-point {
  position: relative;
  width: 6px;
  height: 6px;
  background-color: #000;
  border-radius: 50%;
  z-index: 1;
}

/* 棋子 */
.stone {
  position: relative;
  width: 90%;
  height: 90%;
  border-radius: 50%;
  z-index: 2;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  transition: all var(--transition-fast);
}

.stone--black {
  background: radial-gradient(circle at 30% 30%, #444 0%, #000 100%);
}

.stone--white {
  background: radial-gradient(circle at 30% 30%, #fff 0%, #ccc 100%);
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.stone--last {
  box-shadow: 0 0 0 3px rgba(255, 0, 0, 0.8), 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.board-cell:hover .stone {
  transform: scale(1.05);
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
  gap: var(--spacing-3);
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

.control-buttons {
  display: flex;
  gap: var(--spacing-3);
}

.resign-button,
.new-game-button {
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

.resign-button {
  background-color: var(--color-white);
  color: var(--color-black);
  border: var(--border-width-thin) solid var(--color-gray-300);
}

.new-game-button:hover {
  background-color: var(--color-gray-800);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.resign-button:hover {
  background-color: var(--color-gray-100);
  border-color: var(--color-black);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
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
    font-size: var(--font-size-sm);
  }

  .board-container {
    max-width: 100%;
  }

  .control-buttons {
    flex-direction: column;
  }
}
</style>