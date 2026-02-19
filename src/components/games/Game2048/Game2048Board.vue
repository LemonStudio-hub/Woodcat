<template>
  <div class="game2048-board">
    <div class="game-header">
      <div class="game-title">2048</div>
      <div class="game-status">{{ statusText }}</div>
    </div>

    <div class="score-container">
      <div class="score-box">
        <div class="score-label">分数</div>
        <div class="score-value">{{ score }}</div>
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

      <transition-group name="tile">
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
      </transition-group>
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

/* 方块 */
.tile {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-2xl);
  font-weight: 800;
  border-radius: var(--radius-md);
  transition: left 0.15s ease-in-out, top 0.15s ease-in-out;
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

/* 新方块动画 */
.tile-new {
  animation: appear 0.2s ease-in-out;
}

@keyframes appear {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

/* 合并方块动画 */
.tile-merged {
  animation: pop 0.2s ease-in-out;
}

@keyframes pop {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
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
  animation: fadeIn 0.3s ease-in-out;
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

.overlay-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-4);
  padding: var(--spacing-8);
  background-color: var(--color-white);
  border-radius: var(--radius-xl);
  text-align: center;
}

.overlay-title {
  font-size: var(--font-size-2xl);
  font-weight: 800;
  color: var(--color-black);
}

.overlay-subtitle {
  font-size: var(--font-size-base);
  color: var(--color-gray-500);
}

.overlay-buttons {
  display: flex;
  gap: var(--spacing-3);
}

.overlay-button {
  padding: var(--spacing-3) var(--spacing-6);
  background-color: var(--color-black);
  color: var(--color-white);
  font-size: var(--font-size-base);
  font-weight: 600;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.overlay-button:hover {
  background-color: var(--color-gray-800);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
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
  padding: var(--spacing-3) var(--spacing-6);
  background-color: var(--color-black);
  color: var(--color-white);
  font-size: var(--font-size-base);
  font-weight: 600;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.control-button:hover {
  background-color: var(--color-gray-800);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.control-hint {
  font-size: var(--font-size-sm);
  color: var(--color-gray-500);
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