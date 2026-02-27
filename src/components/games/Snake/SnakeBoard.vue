<template>
  <div class="snake-game">
    <div class="game-header">
      <div class="score-info">
        <div class="score-item">
          <span class="score-label">分数</span>
          <span class="score-value" :class="{ 'increase': scoreIncrease }">{{ score }}</span>
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
          >
            <!-- 蛇头眼睛 -->
            <div v-if="index === 0" class="snake-eyes">
              <div class="eye eye-left"></div>
              <div class="eye eye-right"></div>
            </div>
          </div>
          
          <!-- 食物 -->
          <div
            class="food"
            :class="{ 'food-eaten': foodEaten }"
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

import { ref, onMounted, onUnmounted, watch } from 'vue';
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

// 动画状态
const foodEaten = ref(false);
const scoreIncrease = ref(false);

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

// 监听分数变化
watch(() => score.value, (newScore, oldScore) => {
  if (newScore > oldScore) {
    scoreIncrease.value = true;
    foodEaten.value = true;
    setTimeout(() => {
      scoreIncrease.value = false;
      foodEaten.value = false;
    }, 300);
  }
});

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
  transition: transform 0.2s ease;
}

.score-value.increase {
  animation: scorePop 0.3s ease-out;
  color: var(--color-green-600);
}

@keyframes scorePop {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
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
  background: linear-gradient(135deg, #000000 0%, #333333 100%);
  border-radius: 2px;
  transition: all 0.05s linear;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.snake-head {
  background: linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%);
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.4), 0 4px 8px rgba(0, 0, 0, 0.3);
  z-index: 10;
}

/* 蛇头眼睛 */
.snake-eyes {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.eye {
  position: absolute;
  width: 4px;
  height: 4px;
  background-color: #fff;
  border-radius: 50%;
  animation: blink 3s ease-in-out infinite;
}

.eye-left {
  left: 20%;
  top: 30%;
}

.eye-right {
  right: 20%;
  top: 30%;
}

@keyframes blink {
  0%, 45%, 55%, 100% {
    opacity: 1;
    transform: scaleY(1);
  }
  50% {
    opacity: 0.3;
    transform: scaleY(0.1);
  }
}

/* 食物 */
.food {
  position: absolute;
  background: radial-gradient(circle at 30% 30%, #a3a3a3 0%, #666666 100%);
  border-radius: 50%;
  transition: all 0.05s linear;
  box-shadow: 0 0 10px rgba(102, 102, 102, 0.5), 0 0 20px rgba(102, 102, 102, 0.3);
  animation: foodPulse 1.5s ease-in-out infinite;
}

.food-eaten {
  animation: foodDisappear 0.3s ease-out forwards;
}

@keyframes foodPulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 10px rgba(201, 42, 42, 0.5), 0 0 20px rgba(201, 42, 42, 0.3);
  }
  50% {
    transform: scale(1.1);
    box-shadow: 0 0 15px rgba(201, 42, 42, 0.7), 0 0 30px rgba(201, 42, 42, 0.5);
  }
}

@keyframes foodDisappear {
  0% {
    transform: scale(1.1);
    opacity: 1;
  }
  100% {
    transform: scale(0);
    opacity: 0;
  }
}

/* 开始遮罩 */
.start-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  animation: fadeIn 0.5s ease;
}

.start-button {
  padding: var(--spacing-4) var(--spacing-8);
  background: linear-gradient(135deg, #000000 0%, #333333 100%);
  color: var(--color-white);
  font-size: var(--font-size-xl);
  font-weight: 700;
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
}

.start-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.6s ease;
}

.start-button:hover::before {
  left: 100%;
}

.start-button:hover {
  background: linear-gradient(135deg, #333333 0%, #666666 100%);
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.start-button:active {
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
  background-color: rgba(0, 0, 0, 0.85);
  animation: fadeIn 0.4s ease;
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
  background: linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%);
  border-radius: var(--radius-xl);
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  animation: scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  50% {
    transform: scale(1.05);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.game-over-icon {
  font-size: 5rem;
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-10deg);
  }
  75% {
    transform: rotate(10deg);
  }
}

.game-over-title {
  font-size: var(--font-size-3xl);
  font-weight: 800;
  color: var(--color-black);
  animation: bounceIn 0.6s ease-out;
}

@keyframes bounceIn {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-20px);
  }
  60% {
    transform: translateY(-10px);
  }
}

.game-over-score {
  font-size: var(--font-size-xl);
  color: var(--color-gray-600);
  font-weight: 600;
}

.restart-button {
  padding: var(--spacing-4) var(--spacing-8);
  background: linear-gradient(135deg, #000000 0%, #333333 100%);
  color: var(--color-white);
  font-size: var(--font-size-base);
  font-weight: 600;
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
  border: none;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.restart-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s ease;
}

.restart-button:hover::before {
  left: 100%;
}

.restart-button:hover {
  background: linear-gradient(135deg, #333333 0%, #666666 100%);
  transform: translateY(-3px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.restart-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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