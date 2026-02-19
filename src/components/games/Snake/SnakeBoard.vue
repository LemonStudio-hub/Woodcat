<template>
  <div class="snake-game">
    <div class="game-header">
      <div class="score-info">
        <div class="score-item">
          <span class="score-label">分数</span>
          <span class="score-value">{{ score }}</span>
        </div>
        <div class="score-item">
          <span class="score-label">最高分</span>
          <span class="score-value">{{ bestScore }}</span>
        </div>
      </div>
      <div class="status-text">{{ statusText }}</div>
    </div>

    <div class="game-board">
      <div class="board-container" ref="boardRef">
        <div class="board">
          <!-- 棋盘网格 -->
          <div class="grid-lines">
            <div v-for="i in 20" :key="`h-${i}`" class="grid-line grid-line-horizontal" :style="{ top: `${(i - 1) * 5}%` }"></div>
            <div v-for="i in 20" :key="`v-${i}`" class="grid-line grid-line-vertical" :style="{ left: `${(i - 1) * 5}%` }"></div>
          </div>
          
          <!-- 蛇身 -->
          <div
            v-for="(segment, index) in snake"
            :key="`snake-${index}`"
            class="snake-segment"
            :class="{ 'snake-head': index === 0 }"
            :style="getSegmentStyle(segment)"
          ></div>
          
          <!-- 食物 -->
          <div
            class="food"
            :style="getFoodStyle()"
          ></div>

          <!-- 开始按钮 -->
          <div v-if="!isPlaying && !isGameOver" class="start-overlay">
            <button class="start-button" @click="handleStart">
              开始游戏
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 游戏结束遮罩 -->
    <div v-if="isGameOver" class="game-over-overlay">
      <div class="game-over-content">
        <div class="game-over-icon">💀</div>
        <div class="game-over-title">游戏结束</div>
        <div class="game-over-score">得分：{{ score }}</div>
        <button class="restart-button" @click="handleRestart">
          重新开始
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 贪吃蛇游戏棋盘组件
 * 显示游戏棋盘和蛇的移动
 */

import { ref, onMounted, onUnmounted } from 'vue';
import Hammer from 'hammerjs';
import { useSnakeGame } from '@/composables/useSnakeGame';
import { Direction } from '@/constants/snakeConstants';

// 使用游戏逻辑
const {
  snake,
  food,
  isPlaying,
  isGameOver,
  score,
  bestScore,
  statusText,
  startGame,
  restartGame,
  changeDirection,
} = useSnakeGame();

// 棋盘引用
const boardRef = ref<HTMLElement | null>(null);

// Hammer 实例
let hammer: any = null;

/**
 * 获取蛇身片段样式
 */
function getSegmentStyle(segment: { x: number; y: number }): Record<string, string> {
  const cellSize = 100 / 20; // BOARD_SIZE = 20
  return {
    left: `${segment.x * cellSize}%`,
    top: `${segment.y * cellSize}%`,
    width: `${cellSize}%`,
    height: `${cellSize}%`,
  };
}

/**
 * 获取食物样式
 */
function getFoodStyle(): Record<string, string> {
  const cellSize = 100 / 20; // BOARD_SIZE = 20
  return {
    left: `${food.value.x * cellSize}%`,
    top: `${food.value.y * cellSize}%`,
    width: `${cellSize}%`,
    height: `${cellSize}%`,
  };
}

/**
 * 处理开始游戏
 */
function handleStart(): void {
  startGame();
}

/**
 * 处理重新开始
 */
function handleRestart(): void {
  restartGame();
}

/**
 * 初始化手势控制
 */
function initHammer(): void {
  if (!boardRef.value) return;

  hammer = new Hammer.Manager(boardRef.value);
  
  // 添加滑动手势识别器
  const swipe = new Hammer.Swipe({ direction: Hammer.DIRECTION_ALL, threshold: 30 });
  hammer.add(swipe);

  // 监听滑动事件
  hammer.on('swipeup', () => {
    if (isPlaying.value) changeDirection(Direction.UP);
  });

  hammer.on('swipedown', () => {
    if (isPlaying.value) changeDirection(Direction.DOWN);
  });

  hammer.on('swipeleft', () => {
    if (isPlaying.value) changeDirection(Direction.LEFT);
  });

  hammer.on('swiperight', () => {
    if (isPlaying.value) changeDirection(Direction.RIGHT);
  });
}

/**
 * 清理手势控制
 */
function destroyHammer(): void {
  if (hammer) {
    hammer.destroy();
    hammer = null;
  }
}

// 组件挂载时初始化手势控制
onMounted(() => {
  initHammer();
});

// 组件卸载时清理手势控制
onUnmounted(() => {
  destroyHammer();
});
</script>

<style scoped>
/**
 * 贪吃蛇游戏棋盘组件样式
 */

.snake-game {
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
  font-size: var(--font-size-sm);
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
  inset: 0;
  pointer-events: none;
}

.grid-line {
  position: absolute;
  background-color: var(--color-gray-200);
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

/* 蛇身片段 */
.snake-segment {
  position: absolute;
  background-color: var(--color-black);
  border-radius: 2px;
  transition: all 0.05s linear;
}

.snake-head {
  background-color: var(--color-gray-900);
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
}

/* 食物 */
.food {
  position: absolute;
  background-color: var(--color-gray-600);
  border-radius: 50%;
  transition: all 0.05s linear;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.2);
}

/* 开始遮罩 */
.start-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  animation: fadeIn 0.3s ease;
}

.start-button {
  padding: var(--spacing-4) var(--spacing-8);
  background-color: var(--color-black);
  color: var(--color-white);
  font-size: var(--font-size-xl);
  font-weight: 700;
  border-radius: var(--radius-lg);
  transition: all var(--transition-fast);
  border: none;
  cursor: pointer;
  box-shadow: var(--shadow-lg);
}

.start-button:hover {
  background-color: var(--color-gray-800);
  transform: translateY(-2px);
  box-shadow: var(--shadow-xl);
}

.start-button:active {
  transform: translateY(0);
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

.game-over-score {
  font-size: var(--font-size-lg);
  color: var(--color-gray-600);
}

.restart-button {
  padding: var(--spacing-3) var(--spacing-8);
  background-color: var(--color-black);
  color: var(--color-white);
  font-size: var(--font-size-base);
  font-weight: 600;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  border: none;
  cursor: pointer;
}

.restart-button:hover {
  background-color: var(--color-gray-800);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.restart-button:active {
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
}
</style>