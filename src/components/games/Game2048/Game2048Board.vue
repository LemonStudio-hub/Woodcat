<template>
  <div class="game2048-board">
    <div class="game-header">
      <div class="game-title">2048</div>
      <div class="game-status">{{ statusText }}</div>
    </div>

    <div class="score-container">
      <div class="score-box">
        <div class="score-label">分数</div>
        <div class="score-value" :class="{ 'score-increase': scoreChanged }">{{ score }}</div>
      </div>
      <div class="score-box">
        <div class="score-label">最高分</div>
        <div class="score-value">{{ bestScore }}</div>
      </div>
    </div>

    <div
      ref="boardRef"
      class="board"
      :class="{ 'game-over': gameOver, 'game-won': gameWon }"
    >
      <div class="grid-background">
        <div
          v-for="i in 16"
          :key="`bg-${i}`"
          class="grid-cell"
        ></div>
      </div>

      <div class="tiles-container">
        <div
          v-for="tile in tiles"
          :key="tile.id"
          class="tile"
          :class="[
            `tile-${tile.value}`,
            { 'tile-new': tile.isNew, 'tile-merged': tile.isMerged },
          ]"
          :style="getTileStyle(tile)"
        >
          {{ tile.value }}
        </div>
      </div>
    </div>

    <div class="game-controls">
      <button class="control-button" @click="handleRestart">重新开始</button>
      <div class="control-hint">使用方向键或滑动来移动方块</div>
    </div>
  </div>

  <!-- 游戏结束遮罩 -->
  <div v-if="gameOver" class="game-over-overlay">
    <div class="overlay-content">
      <div class="overlay-title">游戏结束</div>
      <button class="overlay-button" @click="handleRestart">
        再来一局
      </button>
    </div>
  </div>

  <!-- 游戏获胜遮罩 -->
  <div v-if="gameWon" class="game-won-overlay">
    <div class="overlay-content">
      <div class="overlay-title">你赢了！</div>
      <div class="overlay-subtitle">达到 2048</div>
      <div class="overlay-buttons">
        <button class="overlay-button" @click="handleRestart">
          再来一局
        </button>
        <button class="overlay-button overlay-button-secondary" @click="handleContinue">
          继续游戏
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 2048 游戏棋盘组件
 * 显示游戏棋盘和处理用户输入
 */

import { ref, onMounted, onUnmounted } from 'vue';
import Hammer from 'hammerjs';
import type { Tile } from '@/composables/use2048Game';
import { BOARD_SIZE, MIN_SWIPE_DISTANCE } from '@/constants/2048Constants';

// 定义 Hammer 类型
type HammerManager = any;

// 定义 Props
interface Props {
  tiles: Tile[];
  score: number;
  bestScore: number;
  gameOver: boolean;
  gameWon: boolean;
  statusText: string;
}

const props = defineProps<Props>();

// 分数变化状态
const scoreChanged = ref(false);

// 监听分数变化
import { watch } from 'vue';
watch(() => props.score, (newScore, oldScore) => {
  if (newScore > oldScore) {
    scoreChanged.value = true;
    setTimeout(() => {
      scoreChanged.value = false;
    }, 300);
  }
});

// 定义 Emits
interface Emits {
  (e: 'move', direction: 'up' | 'down' | 'left' | 'right'): void;
  (e: 'restart'): void;
  (e: 'continue'): void;
}

const emit = defineEmits<Emits>();

// 棋盘引用
const boardRef = ref<HTMLElement | null>(null);

// Hammer 实例
let hammer: HammerManager | null = null;

/**
 * 获取方块样式
 */
function getTileStyle(tile: Tile): Record<string, string> {
  const cellSize = 100 / BOARD_SIZE;
  const gap = 1.5; // 间距百分比

  return {
    left: `${tile.col * cellSize + gap}%`,
    top: `${tile.row * cellSize + gap}%`,
    width: `${cellSize - gap * 2}%`,
    height: `${cellSize - gap * 2}%`,
  };
}

/**
 * 处理键盘事件
 */
function handleKeydown(event: KeyboardEvent): void {
  const keyMap: Record<string, 'up' | 'down' | 'left' | 'right'> = {
    ArrowUp: 'up',
    ArrowDown: 'down',
    ArrowLeft: 'left',
    ArrowRight: 'right',
    w: 'up',
    s: 'down',
    a: 'left',
    d: 'right',
  };

  const direction = keyMap[event.key];
  if (direction) {
    event.preventDefault();
    emit('move', direction);
  }
}

/**
 * 初始化手势识别
 */
function initGestures(): void {
  if (!boardRef.value) return;

  hammer = new Hammer.Manager(boardRef.value);

  // 添加滑动手势
  const swipe = new Hammer.Swipe({
    direction: Hammer.DIRECTION_ALL,
    threshold: MIN_SWIPE_DISTANCE,
  });

  hammer.add(swipe);

  // 监听滑动手势
  hammer.on('swipeleft', () => emit('move', 'left'));
  hammer.on('swiperight', () => emit('move', 'right'));
  hammer.on('swipeup', () => emit('move', 'up'));
  hammer.on('swipedown', () => emit('move', 'down'));
}

/**
 * 清理手势识别
 */
function destroyGestures(): void {
  if (hammer) {
    hammer.destroy();
    hammer = null;
  }
}

/**
 * 处理重新开始
 */
function handleRestart(): void {
  emit('restart');
}

/**
 * 处理继续游戏
 */
function handleContinue(): void {
  emit('continue');
}

// 组件挂载时初始化
onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
  initGestures();
});

// 组件卸载时清理
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
  destroyGestures();
});
</script>

<style scoped>
/**
 * 2048 游戏棋盘组件样式
 */

.game2048-board {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
  padding: var(--spacing-8);
}

/* 游戏头部 */
.game-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.game-title {
  font-size: var(--font-size-4xl);
  font-weight: 800;
  color: var(--color-black);
  letter-spacing: 0.05em;
}

.game-status {
  font-size: var(--font-size-base);
  color: var(--color-gray-500);
  font-weight: 600;
}

/* 分数容器 */
.score-container {
  display: flex;
  gap: var(--spacing-4);
}

.score-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-3);
  background-color: var(--color-gray-100);
  border-radius: var(--radius-md);
}

.score-label {
  font-size: var(--font-size-sm);
  color: var(--color-gray-500);
  font-weight: 600;
}

.score-value {
  font-size: var(--font-size-xl);
  font-weight: 800;
  color: var(--color-black);
}

/* 棋盘 */
.board {
  position: relative;
  width: 100%;
  padding-bottom: 100%; /* 1:1 比例 */
  background-color: var(--color-gray-200);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.grid-background {
  position: absolute;
  inset: 0;
  padding: 1.5%;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(4, 1fr);
  gap: 1.5%;
}

.grid-cell {
  background-color: var(--color-gray-100);
  border-radius: var(--radius-md);
}

/* 方块容器 */
.tiles-container {
  position: absolute;
  inset: 0;
  padding: 1.5%;
  pointer-events: none;
}

/* 方块 */
.tile {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-2xl);
  font-weight: 800;
  border-radius: var(--radius-md);
  transition: left 0.15s ease-in-out, top 0.15s ease-in-out, transform 0.15s ease-in-out;
  pointer-events: auto;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 不同数值的方块颜色 */
.tile-2 {
  background-color: #f5f5f5;
  color: #000;
}

.tile-4 {
  background-color: #e5e5e5;
  color: #000;
}

.tile-8 {
  background-color: #d4d4d4;
  color: #000;
}

.tile-16 {
  background-color: #a3a3a3;
  color: #fff;
}

.tile-32 {
  background-color: #737373;
  color: #fff;
}

.tile-64 {
  background-color: #525252;
  color: #fff;
}

.tile-128 {
  background-color: #404040;
  color: #fff;
  font-size: var(--font-size-xl);
}

.tile-256 {
  background-color: #262626;
  color: #fff;
  font-size: var(--font-size-xl);
}

.tile-512 {
  background-color: #171717;
  color: #fff;
  font-size: var(--font-size-xl);
}

.tile-1024,
.tile-2048,
.tile-4096,
.tile-8192 {
  background-color: #000;
  color: #fff;
  font-size: var(--font-size-lg);
}

/* 分数增加动画 */
.score-increase {
  animation: scoreBounce 0.3s ease-out;
}

@keyframes scoreBounce {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.15);
    color: var(--color-green-600);
  }
}

/* 新方块动画 */
.tile-new {
  animation: appear 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes appear {
  0% {
    transform: scale(0) rotate(-10deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.1) rotate(5deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

/* 合并方块动画 */
.tile-merged {
  animation: pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
  z-index: 10;
}

@keyframes pop {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.25);
  }
  100% {
    transform: scale(1);
  }
}

/* 高价值方块光效 */
.tile-1024,
.tile-2048,
.tile-4096,
.tile-8192 {
  position: relative;
  overflow: hidden;
}

.tile-1024::after,
.tile-2048::after,
.tile-4096::after,
.tile-8192::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent 30%,
    rgba(255, 255, 255, 0.3) 50%,
    transparent 70%
  );
  animation: shine 2s ease-in-out infinite;
}

@keyframes shine {
  0% {
    transform: translateY(-50%) rotate(0deg);
  }
  100% {
    transform: translateY(50%) rotate(360deg);
  }
}

/* 游戏结束/获胜遮罩 */
.game-over-overlay,
.game-won-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.4s ease-in-out;
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

.game-won-overlay {
  background-color: rgba(34, 197, 94, 0.9);
}

.overlay-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-4);
  padding: var(--spacing-8);
  background-color: var(--color-white);
  border-radius: var(--radius-xl);
  text-align: center;
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

.overlay-title {
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

.overlay-subtitle {
  font-size: var(--font-size-lg);
  color: var(--color-gray-500);
  font-weight: 600;
}

.overlay-buttons {
  display: flex;
  gap: var(--spacing-3);
  flex-wrap: wrap;
  justify-content: center;
}

.overlay-button {
  padding: var(--spacing-4) var(--spacing-8);
  background-color: var(--color-black);
  color: var(--color-white);
  font-size: var(--font-size-base);
  font-weight: 600;
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
  position: relative;
  overflow: hidden;
}

.overlay-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s ease;
}

.overlay-button:hover::before {
  left: 100%;
}

.overlay-button:hover {
  background-color: var(--color-gray-800);
  transform: translateY(-3px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.overlay-button-secondary {
  background-color: var(--color-gray-200);
  color: var(--color-black);
}

.overlay-button-secondary:hover {
  background-color: var(--color-gray-300);
}

/* 游戏控制 */
.game-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-2);
}

.control-button {
  padding: var(--spacing-3) var(--spacing-8);
  background-color: var(--color-black);
  color: var(--color-white);
  font-size: var(--font-size-base);
  font-weight: 600;
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
  position: relative;
  overflow: hidden;
}

.control-button::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.3s ease, height 0.3s ease;
}

.control-button:active::before {
  width: 200%;
  height: 200%;
}

.control-button:hover {
  background-color: var(--color-gray-800);
  transform: translateY(-3px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.control-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.control-hint {
  font-size: var(--font-size-sm);
  color: var(--color-gray-500);
  opacity: 0.8;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.8;
  }
  50% {
    opacity: 0.5;
  }
}

/* 响应式设计 */
@media (max-width: 640px) {
  .game2048-board {
    padding: var(--spacing-4);
    gap: var(--spacing-4);
  }

  .game-title {
    font-size: var(--font-size-2xl);
  }

  .tile {
    font-size: var(--font-size-xl);
  }

  .tile-128,
  .tile-256,
  .tile-512 {
    font-size: var(--font-size-lg);
  }

  .tile-1024,
  .tile-2048,
  .tile-4096,
  .tile-8192 {
    font-size: var(--font-size-base);
  }
}
</style>