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
          <div class="grid-lines">
            <div
              v-for="i in BOARD_SIZE"
              :key="`h-${i}`"
              class="grid-line grid-line-horizontal"
              :style="{ top: `${((i - 1) / (BOARD_SIZE - 1)) * 100}%` }"
            ></div>
            <div
              v-for="i in BOARD_SIZE"
              :key="`v-${i}`"
              class="grid-line grid-line-vertical"
              :style="{ left: `${((i - 1) / (BOARD_SIZE - 1)) * 100}%` }"
            ></div>
          </div>
          
          <!-- 星位点 -->
          <div
            v-for="(starPoint, index) in starPoints"
            :key="`star-${index}`"
            class="star-point"
            :style="getIntersectionStyle(starPoint.row, starPoint.col)"
          ></div>
          
          <!-- 交叉点（点击区域和棋子） -->
          <div
            v-for="(row, rowIndex) in board"
            :key="`row-${rowIndex}`"
          >
            <div
              v-for="(cell, colIndex) in row"
              :key="`cell-${rowIndex}-${colIndex}`"
              class="intersection"
              :style="getIntersectionStyle(rowIndex, colIndex)"
              @click="handleCellClick(rowIndex, colIndex)"
            >
              <div
                v-if="cell !== Player.EMPTY"
                class="stone"
                :class="{ 
                  'stone-black': cell === Player.BLACK, 
                  'stone-white': cell === Player.WHITE,
                  'stone-last': isLastMove(rowIndex, colIndex),
                  'stone-place': hasAnimation(rowIndex, colIndex) === 'place',
                  'stone-capture': hasAnimation(rowIndex, colIndex) === 'capture',
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

import { onMounted, onUnmounted } from 'vue';
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
  animations,
  lastMove,
  placeStone,
  resign,
  startNewGame,
  getStoneAt,
} = useGoGame();

// 星位点坐标
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

/**
 * 检查是否是最后一步
 */
function isLastMove(row: number, col: number): boolean {
  return lastMove.value !== null && lastMove.value.row === row && lastMove.value.col === col;
}

/**
 * 检查是否有动画
 */
function hasAnimation(row: number, col: number): string | null {
  const key = `place-${row}-${col}`;
  const key2 = `capture-${row}-${col}`;
  
  if (animations.value.has(key)) {
    return 'place';
  }
  if (animations.value.has(key2)) {
    return 'capture';
  }
  
  return null;
}

/**
 * 获取交叉点样式
 */
function getIntersectionStyle(row: number, col: number): Record<string, string> {
  const padding = 2; // 边距百分比
  const gridSize = BOARD_SIZE - 1;
  return {
    left: `${padding + (col / gridSize) * (100 - 2 * padding)}%`,
    top: `${padding + (row / gridSize) * (100 - 2 * padding)}%`,
    transform: 'translate(-50%, -50%)',
  };
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

/**
 * 清理过期的动画
 */
let animationCleanupTimer: number | null = null;

function startAnimationCleanup(): void {
  animationCleanupTimer = window.setInterval(() => {
    const now = Date.now();
    const expiredKeys: string[] = [];

    animations.value.forEach((animation, key) => {
      // 放置动画0.3秒，被吃动画0.4秒，给点余量1秒后清理
      if (now - animation.timestamp > 1000) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach((key) => {
      animations.value.delete(key);
    });
  }, 100);
}

function stopAnimationCleanup(): void {
  if (animationCleanupTimer !== null) {
    clearInterval(animationCleanupTimer);
    animationCleanupTimer = null;
  }
}

onMounted(() => {
  startAnimationCleanup();
});

onUnmounted(() => {
  stopAnimationCleanup();
});
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
  position: relative;
  width: 100%;
  height: 100%;
  background-color: var(--color-white);
  border: var(--border-width-medium) solid var(--color-black);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

/* 棋盘网格 */
.grid-lines {
  position: absolute;
  inset: 2%;
  pointer-events: none;
}

.grid-line {
  position: absolute;
  background-color: var(--color-gray-300);
}

.grid-line-horizontal {
  left: 0;
  right: 0;
  height: 1px;
}

.grid-line-vertical {
  top: 0;
  bottom: 0;
  width: 1px;
}

/* 星位点 */
.star-point {
  position: absolute;
  width: 6px;
  height: 6px;
  background-color: var(--color-black);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  z-index: 5;
}

/* 交叉点（点击区域和棋子位置） */
.intersection {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 5%;
  height: 5%;
  cursor: pointer;
  transition: all var(--transition-fast);
  z-index: 10;
}

.intersection:hover::before {
  content: '';
  position: absolute;
  width: 60%;
  height: 60%;
  background: radial-gradient(circle, rgba(0, 0, 0, 0.1) 0%, transparent 70%);
  border-radius: 50%;
  animation: hoverPulse 0.5s ease-in-out infinite alternate;
}

@keyframes hoverPulse {
  from {
    transform: scale(0.9);
    opacity: 0.7;
  }
  to {
    transform: scale(1.1);
    opacity: 1;
  }
}

/* 棋子 */
.stone {
  width: 90%;
  height: 90%;
  border-radius: 50%;
  z-index: 20;
  transition: all var(--transition-fast);
}

.stone-black {
  background: radial-gradient(circle at 30% 30%, #4a4a4a 0%, #000000 100%);
  box-shadow: 
    0 4px 8px rgba(0, 0, 0, 0.4),
    0 2px 4px rgba(0, 0, 0, 0.2),
    inset 0 2px 4px rgba(255, 255, 255, 0.1);
  position: relative;
}

.stone-black::after {
  content: '';
  position: absolute;
  top: 15%;
  left: 15%;
  width: 30%;
  height: 30%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%);
  border-radius: 50%;
}

.stone-white {
  background: radial-gradient(circle at 30% 30%, #ffffff 0%, #e0e0e0 100%);
  box-shadow: 
    0 4px 8px rgba(0, 0, 0, 0.3),
    0 2px 4px rgba(0, 0, 0, 0.15),
    inset 0 -2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(200, 200, 200, 0.5);
  position: relative;
}

.stone-white::after {
  content: '';
  position: absolute;
  top: 10%;
  left: 10%;
  width: 40%;
  height: 40%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, transparent 70%);
  border-radius: 50%;
}

/* 最后一步标记 */
.stone-last {
  box-shadow: 
    0 0 0 2px rgba(255, 0, 0, 0.8),
    0 4px 8px rgba(0, 0, 0, 0.4),
    0 2px 4px rgba(0, 0, 0, 0.2);
  animation: lastMovePulse 2s ease-in-out infinite;
}

/* 动画效果 */
.stone-place {
  animation: stonePlace 0.3s ease-out forwards;
}

.stone-capture {
  animation: stoneCapture 0.4s ease-out forwards;
}

/* 动画关键帧 */
@keyframes stonePlace {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes stoneCapture {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.5;
  }
  100% {
    transform: scale(0);
    opacity: 0;
  }
}

@keyframes lastMovePulse {
  0%, 100% {
    box-shadow: 
      0 0 0 2px rgba(255, 0, 0, 0.8),
      0 4px 8px rgba(0, 0, 0, 0.4),
      0 2px 4px rgba(0, 0, 0, 0.2);
  }
  50% {
    box-shadow: 
      0 0 0 4px rgba(255, 0, 0, 0.5),
      0 4px 8px rgba(0, 0, 0, 0.4),
      0 2px 4px rgba(0, 0, 0, 0.2);
  }
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
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid var(--color-gray-300);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
  font-size: var(--font-size-base);
  font-weight: 600;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  border: none;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.resign-button {
  background-color: var(--color-white);
  color: var(--color-black);
  border: var(--border-width-thin) solid var(--color-gray-300);
}

.resign-button:hover {
  background-color: var(--color-gray-100);
  border-color: var(--color-black);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.new-game-button {
  background-color: var(--color-black);
  color: var(--color-white);
}

.new-game-button:hover {
  background-color: var(--color-gray-800);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.resign-button:active,
.new-game-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
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

.game-over-buttons .new-game-button {
  background-color: var(--color-black);
  color: var(--color-white);
}

.game-over-buttons .new-game-button:hover {
  background-color: var(--color-gray-800);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
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
    width: 100%;
  }

  .resign-button,
  .new-game-button {
    width: 100%;
  }
}
</style>