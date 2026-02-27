<template>
  <div class="minesweeper-game">
    <div class="game-header">
      <div class="difficulty-selector">
        <button
          v-for="key in Object.keys(DIFFICULTY_CONFIG)"
          :key="key"
          class="difficulty-button"
          :class="{ 'difficulty-button--active': difficulty === key }"
          @click="handleDifficultyChange(key as Difficulty)"
        >
          {{ DIFFICULTY_NAMES[key as Difficulty] }}
        </button>
      </div>
      <div class="status-display">
        <div class="status-item">
          <span class="status-label">💣</span>
          <span class="status-value">{{ remainingMines }}</span>
        </div>
        <div class="status-item">
          <span class="status-label">⏱️</span>
          <span class="status-value">{{ formatTime(gameTime) }}</span>
        </div>
      </div>
    </div>

    <div class="game-board">
      <div class="board-container">
        <div
          class="board"
          :style="{ 
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`
          }"
        >
          <div
            v-for="(cell, index) in allCells"
            :key="index"
            class="cell"
            :class="{
              'cell--hidden': cell.state === CellState.HIDDEN,
              'cell--revealed': cell.state === CellState.REVEALED,
              'cell--flagged': cell.state === CellState.FLAGGED,
              'cell--mine': cell.isMine && cell.state === CellState.REVEALED,
              'cell--mine-exploded': cell.isMine && cell.state === CellState.REVEALED && gameState === GameState.LOST,
            }"
            @click.left="handleCellClick(cell)"
            @click.right.prevent="handleRightClick(cell)"
          >
            <span v-if="cell.state === CellState.FLAGGED" class="cell-icon">🚩</span>
            <span v-else-if="cell.isMine && cell.state === CellState.REVEALED" class="cell-icon">💣</span>
            <span v-else-if="cell.state === CellState.REVEALED && cell.adjacentMines > 0" class="cell-number" :class="`cell-number--${cell.adjacentMines}`">
              {{ cell.adjacentMines }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="game-controls">
      <div class="control-info">
        <div class="status-text">{{ statusText }}</div>
        <div class="stats-info">
          <span>已玩: {{ stats.gamesPlayed }}</span>
          <span>胜: {{ stats.gamesWon }}</span>
          <span>负: {{ stats.gamesLost }}</span>
        </div>
        <div v-if="stats.bestTimes[difficulty]" class="best-time">
          最佳时间: {{ formatTime(stats.bestTimes[difficulty]!) }}
        </div>
      </div>
    </div>
  </div>

  <!-- 游戏结束遮罩 -->
  <div v-if="gameState !== GameState.PLAYING" class="game-over-overlay">
    <div class="game-over-content">
            <div class="game-over-icon">{{ gameState === GameState.WON ? '🎉' : '💥' }}</div>
            <div class="game-over-title">{{ statusText }}</div>      <div class="game-over-info">
        <div>用时: {{ formatTime(gameTime) }}</div>
      </div>
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
 * 扫雷游戏棋盘组件
 * 显示游戏棋盘和格子
 */

import { computed } from 'vue';
import { useMinesweeperGame } from '@/composables/useMinesweeperGame';
import {
  Difficulty,
  CellState,
  GameState,
  DIFFICULTY_CONFIG,
  DIFFICULTY_NAMES,
  type Cell,
} from '@/constants/minesweeperConstants';

// 使用游戏逻辑
const {
  cells,
  difficulty,
  gameState,
  gameTime,
  remainingMines,
  rows,
  cols,
  stats,
  statusText,
  revealCell,
  toggleFlag,
  setDifficulty,
  startNewGame,
  resetAllStats,
  loadStats,
  saveStats,
} = useMinesweeperGame();

// 初始化时加载数据
loadStats();

/**
 * 所有格子（平铺数组）
 */
const allCells = computed(() => {
  const result: Cell[] = [];
  for (let r = 0; r < rows.value; r++) {
    for (let c = 0; c < cols.value; c++) {
      result.push(cells.value[r][c]);
    }
  }
  return result;
});

/**
 * 格式化时间
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * 处理难度变化
 */
function handleDifficultyChange(newDifficulty: Difficulty): void {
  setDifficulty(newDifficulty);
  saveStats();
}

/**
 * 处理格子点击（左键）
 */
function handleCellClick(cell: Cell): void {
  if (gameState.value !== GameState.PLAYING) return;
  revealCell({ row: cell.row, col: cell.col });
}

/**
 * 处理格子右键点击
 */
function handleRightClick(cell: Cell): void {
  if (gameState.value !== GameState.PLAYING) return;
  toggleFlag({ row: cell.row, col: cell.col });
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
 * 扫雷游戏棋盘组件样式
 */

.minesweeper-game {
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
  flex-wrap: wrap;
  gap: var(--spacing-3);
}

.difficulty-selector {
  display: flex;
  gap: var(--spacing-2);
}

.difficulty-button {
  padding: var(--spacing-2) var(--spacing-4);
  background-color: var(--color-white);
  color: var(--color-black);
  font-size: var(--font-size-sm);
  font-weight: 600;
  border: var(--border-width-thin) solid var(--color-gray-300);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  cursor: pointer;
}

.difficulty-button:hover {
  border-color: var(--color-black);
}

.difficulty-button--active {
  background-color: var(--color-black);
  color: var(--color-white);
  border-color: var(--color-black);
}

.status-display {
  display: flex;
  gap: var(--spacing-4);
}

.status-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  padding: var(--spacing-2) var(--spacing-3);
  background-color: var(--color-white);
  border: var(--border-width-thin) solid var(--color-gray-300);
  border-radius: var(--radius-md);
}

.status-label {
  font-size: var(--font-size-base);
}

.status-value {
  font-size: var(--font-size-base);
  font-weight: 700;
  font-family: monospace;
  min-width: 3ch;
}

/* 游戏棋盘 */
.game-board {
  display: flex;
  justify-content: center;
  overflow-x: auto;
}

.board-container {
  display: flex;
  flex-direction: column;
}

.board {
  display: grid;
  gap: 1px;
  background-color: var(--color-gray-400);
  border: var(--border-width-medium) solid var(--color-gray-400);
  user-select: none;
}

.cell {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-base);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.cell--hidden {
  background-color: var(--color-gray-200);
}

.cell--hidden:hover {
  background-color: var(--color-gray-300);
}

.cell--revealed {
  background-color: var(--color-white);
  cursor: default;
}

.cell--flagged {
  background-color: var(--color-gray-200);
}

.cell--mine {
  background-color: var(--color-red-100);
}

.cell--mine-exploded {
  background-color: var(--color-red-500);
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
}

.cell-icon {
  font-size: var(--font-size-lg);
}

.cell-number {
  font-weight: 700;
}

.cell-number--1 {
  color: #0000ff;
}

.cell-number--2 {
  color: #008000;
}

.cell-number--3 {
  color: #ff0000;
}

.cell-number--4 {
  color: #000080;
}

.cell-number--5 {
  color: #800000;
}

.cell-number--6 {
  color: #008080;
}

.cell-number--7 {
  color: #000000;
}

.cell-number--8 {
  color: #808080;
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

.status-text {
  font-size: var(--font-size-base);
  color: var(--color-gray-600);
  font-weight: 600;
}

.stats-info {
  display: flex;
  gap: var(--spacing-4);
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
}

.best-time {
  font-size: var(--font-size-sm);
  color: var(--color-green-600);
  font-weight: 600;
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

.game-over-info {
  font-size: var(--font-size-base);
  color: var(--color-gray-600);
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

/* 响应式设计 */
@media (max-width: 640px) {
  .game-header {
    padding: var(--spacing-3);
    gap: var(--spacing-2);
  }

  .difficulty-selector {
    flex-wrap: wrap;
  }

  .difficulty-button {
    padding: var(--spacing-1) var(--spacing-3);
    font-size: var(--font-size-xs);
  }

  .cell {
    width: 2rem;
    height: 2rem;
    font-size: var(--font-size-sm);
  }

  .cell-icon {
    font-size: var(--font-size-base);
  }

  .game-over-buttons {
    flex-direction: column;
  }
}
</style>