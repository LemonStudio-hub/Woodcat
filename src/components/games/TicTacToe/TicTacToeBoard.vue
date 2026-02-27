<template>
  <div class="tictactoe-game">
    <div class="game-header">
      <div class="score-info">
        <div class="score-item">
          <span class="score-label">X</span>
          <span class="score-value">{{ xWins }}</span>
        </div>
        <div class="score-item">
          <span class="score-label">平局</span>
          <span class="score-value">{{ draws }}</span>
        </div>
        <div class="score-item">
          <span class="score-label">O</span>
          <span class="score-value">{{ oWins }}</span>
        </div>
      </div>
      <div class="status-text">{{ statusText }}</div>
    </div>

    <div class="game-board">
      <div class="board-container">
        <div class="board">
          <div
            v-for="(cell, index) in board"
            :key="index"
            class="cell"
            :class="{ 
              'cell-x': cell === Cell.X, 
              'cell-o': cell === Cell.O,
              'cell-winning': isInWinningLine(index)
            }"
            @click="handleCellClick(index)"
          >
            {{ cell }}
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 游戏结束遮罩 -->
  <div v-if="gameState !== GameState.PLAYING" class="game-over-overlay">
    <div class="game-over-content">
      <div class="game-over-icon">{{ gameState === GameState.DRAW ? '🤝' : '🎉' }}</div>
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
 * 井字棋游戏棋盘组件
 * 显示游戏棋盘和棋子
 */

import { useTicTacToeGame } from '@/composables/useTicTacToeGame';
import { Cell, GameState } from '@/constants/ticTacToeConstants';

// 使用游戏逻辑
const {
  board,
  gameState,
  xWins,
  oWins,
  draws,
  winningCombination,
  statusText,
  placePiece,
  startNewGame,
  resetAllStats,
} = useTicTacToeGame();

/**
 * 检查位置是否在获胜连线上
 */
function isInWinningLine(index: number): boolean {
  return winningCombination.value?.includes(index) ?? false;
}

/**
 * 处理单元格点击
 */
function handleCellClick(index: number): void {
  placePiece(index);
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
 * 井字棋游戏棋盘组件样式
 */

.tictactoe-game {
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
  max-width: 400px;
  aspect-ratio: 1 / 1;
}

.board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  width: 100%;
  height: 100%;
  background-color: var(--color-black);
  border: var(--border-width-thick) solid var(--color-black);
  border-radius: var(--radius-md);
  gap: var(--border-width-thick);
}

.cell {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  font-weight: 800;
  background-color: var(--color-white);
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
  overflow: hidden;
}

.cell:hover::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, rgba(0, 0, 0, 0.05) 0%, transparent 70%);
  animation: hoverPulse 0.5s ease-in-out infinite alternate;
}

@keyframes hoverPulse {
  from {
    opacity: 0.7;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.cell-x {
  color: var(--color-black);
  animation: cellAppear 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2), -1px -1px 2px rgba(255, 255, 255, 0.1);
  position: relative;
}

.cell-x::after {
  content: '';
  position: absolute;
  inset: 10%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  animation: shine 2s ease-in-out infinite;
}

.cell-o {
  color: var(--color-black);
  animation: cellAppear 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2), -1px -1px 2px rgba(255, 255, 255, 0.1);
  position: relative;
}

.cell-o::after {
  content: '';
  position: absolute;
  inset: 10%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  animation: shine 2s ease-in-out infinite 0.5s;
}

@keyframes cellAppear {
  0% {
    transform: scale(0) rotate(-10deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.2) rotate(5deg);
    opacity: 1;
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

@keyframes shine {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.2);
  }
}

/* 获胜连线高亮 */
.cell-winning {
  animation: winningPulse 1s ease-in-out infinite;
  position: relative;
}

.cell-winning::before {
  content: '';
  position: absolute;
  inset: 4px;
  border-radius: 8px;
  background: conic-gradient(
    from 0deg,
    #ff6b6b,
    #ffd93d,
    #6bcb77,
    #4d96ff,
    #ff6b6b
  );
  animation: winningGlow 2s linear infinite;
  z-index: -1;
  filter: blur(4px);
}

@keyframes winningPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@keyframes winningGlow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 游戏结束遮罩 */
.game-over-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.85);
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
  background: linear-gradient(135deg, #ffffff 0%, #f8f8f8 100%);
  border-radius: var(--radius-xl);
  text-align: center;
  animation: bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

@keyframes bounceIn {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.game-over-icon {
  font-size: 4rem;
  animation: iconPulse 0.6s ease-in-out infinite alternate;
}

@keyframes iconPulse {
  from {
    transform: scale(1);
  }
  to {
    transform: scale(1.15);
  }
}

.game-over-title {
  font-size: var(--font-size-2xl);
  font-weight: 800;
  color: var(--color-black);
  animation: titleSlideIn 0.4s ease-out 0.2s both;
}

@keyframes titleSlideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
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
  position: relative;
  overflow: hidden;
}

.new-game-button::before,
.reset-all-button::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.new-game-button:active::before,
.reset-all-button:active::before {
  width: 300px;
  height: 300px;
}

.reset-all-button {
  background-color: var(--color-white);
  color: var(--color-black);
  border: var(--border-width-thin) solid var(--color-gray-300);
}

.new-game-button:hover {
  background-color: var(--color-gray-800);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3), 0 0 20px rgba(0, 0, 0, 0.1);
}

.reset-all-button:hover {
  background-color: var(--color-gray-100);
  border-color: var(--color-black);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15), 0 0 20px rgba(0, 0, 0, 0.05);
}

.new-game-button:active,
.reset-all-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
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

  .cell {
    font-size: 3rem;
  }

  .game-over-buttons {
    flex-direction: column;
  }
}
</style>