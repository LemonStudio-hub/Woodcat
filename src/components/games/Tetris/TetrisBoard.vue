<template>
  <div class="tetris-game">
    <div class="game-header">
      <div class="status-text">{{ statusText }}</div>
      <div class="high-score-text">最高分：{{ highScore }}</div>
    </div>

    <div class="game-board">
      <div class="board-container">
        <div ref="boardRef" class="board">
          <!-- 渲染棋盘和当前方块 -->
          <div
            v-for="(row, rowIndex) in board"
            :key="`row-${rowIndex}`"
            class="board-row"
          >
            <div
              v-for="(_cell, colIndex) in row"
              :key="`cell-${rowIndex}-${colIndex}`"
              class="board-cell"
              :style="getCellStyle(rowIndex, colIndex)"
            >
              {{ getCellContent(rowIndex, colIndex) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 控制说明 -->
    <div class="controls-info">
      <div class="control-item">
        <span class="control-icon">←</span>
        <span class="control-desc">左移</span>
      </div>
      <div class="control-item">
        <span class="control-icon">→</span>
        <span class="control-desc">右移</span>
      </div>
      <div class="control-item">
        <span class="control-icon">↑</span>
        <span class="control-desc">旋转</span>
      </div>
      <div class="control-item">
        <span class="control-icon">↓</span>
        <span class="control-desc">快速下落</span>
      </div>
    </div>
  </div>

  <!-- 游戏结束遮罩 -->
  <div v-if="gameState !== GameState.PLAYING" class="game-over-overlay">
    <div class="game-over-content">
      <div class="game-over-icon">🎮</div>
      <div class="game-over-title">游戏结束</div>
      <div class="game-over-score">最终得分：{{ score }}</div>
      <button class="restart-button" @click="handleRestart">
        再来一局
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 俄罗斯方块游戏棋盘组件
 * 显示游戏棋盘和控制
 */

import { ref, onMounted, onUnmounted } from 'vue';
import Hammer from 'hammerjs';
import { useTetrisGame } from '@/composables/useTetrisGame';
import { GameState, BlockType, BLOCK_COLORS } from '@/constants/tetrisConstants';

// 使用游戏逻辑
const {
  board,
  gameState,
  score,
  highScore,
  currentBlock,
  statusText,
  moveBlock,
  rotateBlock,
  hardDrop,
  startGame,
  restartGame,
} = useTetrisGame();

/**
 * 棋盘引用
 */
const boardRef = ref<HTMLElement | null>(null);

/**
 * Hammer.js 实例
 */
let hammer: any = null;

/**
 * 最小滑动距离
 */
const MIN_SWIPE_DISTANCE = 30;

/**
 * 获取单元格样式
 */
function getCellStyle(row: number, col: number): Record<string, string> {
  // 检查是否是当前方块的一部分
  if (currentBlock.value) {
    const shape = currentBlock.value.shape;
    const blockX = currentBlock.value.x;
    const blockY = currentBlock.value.y;
    
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] !== BlockType.EMPTY) {
          const cellRow = blockY + y;
          const cellCol = blockX + x;
          
          if (cellRow === row && cellCol === col) {
            return {
              backgroundColor: BLOCK_COLORS[currentBlock.value.type],
            };
          }
        }
      }
    }
  }
  
  // 显示棋盘上的方块
  const cellType = board.value[row][col];
  if (cellType !== BlockType.EMPTY) {
    return {
      backgroundColor: BLOCK_COLORS[cellType],
    };
  }
  
  // 空单元格
  return {
    backgroundColor: 'var(--color-white)',
  };
}

/**
 * 获取单元格内容
 */
function getCellContent(_row: number, _col: number): string {
  return '';
}

/**
 * 初始化手势识别
 */
function initGestures(): void {
  if (!boardRef.value) return;

  const manager = new (Hammer as any).Manager(boardRef.value);
  hammer = manager;

  // 添加滑动手势
  const swipe = new (Hammer as any).Swipe({
    direction: (Hammer as any).DIRECTION_ALL,
    threshold: MIN_SWIPE_DISTANCE,
  });

  manager.add(swipe);

  // 监听滑动手势
  manager.on('swipeleft', () => {
    if (gameState.value === GameState.PLAYING) {
      moveBlock(-1);
    }
  });

  manager.on('swiperight', () => {
    if (gameState.value === GameState.PLAYING) {
      moveBlock(1);
    }
  });

  manager.on('swipeup', () => {
    if (gameState.value === GameState.PLAYING) {
      rotateBlock();
    }
  });

  manager.on('swipedown', () => {
    if (gameState.value === GameState.PLAYING) {
      hardDrop();
    }
  });
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
  restartGame();
}

/**
 * 处理键盘事件
 */
function handleKeyDown(event: KeyboardEvent): void {
  if (gameState.value !== GameState.PLAYING) {
    return;
  }
  
  switch (event.key) {
    case 'ArrowLeft':
      moveBlock(-1);
      event.preventDefault();
      break;
    case 'ArrowRight':
      moveBlock(1);
      event.preventDefault();
      break;
    case 'ArrowUp':
      rotateBlock();
      event.preventDefault();
      break;
    case 'ArrowDown':
      hardDrop();
      event.preventDefault();
      break;
  }
}

// 组件挂载时初始化游戏、手势和键盘监听
onMounted(() => {
  startGame();
  initGestures();
  window.addEventListener('keydown', handleKeyDown);
});

// 组件卸载时清理手势和键盘监听
onUnmounted(() => {
  destroyGestures();
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<style scoped>
/**
 * 俄罗斯方块游戏棋盘组件样式
 */

.tetris-game {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
}

/* 游戏头部 */
.game-header {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-4);
  background-color: var(--color-gray-100);
  border-radius: var(--radius-lg);
}

.status-text {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-black);
}

.high-score-text {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-gray-600);
}

/* 游戏棋盘 */
.game-board {
  display: flex;
  justify-content: center;
}

.board-container {
  width: 100%;
  max-width: 400px;
  aspect-ratio: 10 / 20;
}

.board {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  grid-template-rows: repeat(20, 1fr);
  width: 100%;
  height: 100%;
  background-color: var(--color-black);
  border: var(--border-width-thick) solid var(--color-black);
  border-radius: var(--radius-md);
  gap: 1px;
}

.board-row {
  display: contents;
}

.board-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 800;
  background-color: var(--color-white);
  transition: background-color var(--transition-fast);
}

/* 控制说明 */
.controls-info {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-4);
  padding: var(--spacing-4);
  background-color: var(--color-gray-100);
  border-radius: var(--radius-lg);
}

.control-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-1);
}

.control-icon {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-black);
}

.control-desc {
  font-size: var(--font-size-xs);
  color: var(--color-gray-600);
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

.game-over-score {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--color-gray-600);
}

.restart-button {
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
  }

  .status-text {
    font-size: var(--font-size-lg);
  }

  .board-container {
    max-width: 100%;
  }

  .board-cell {
    font-size: 0.6rem;
  }

  .controls-info {
    grid-template-columns: repeat(2, 1fr);
  }

  .game-over-content {
    padding: var(--spacing-6);
  }

  .game-over-icon {
    font-size: 3rem;
  }

  .game-over-title {
    font-size: var(--font-size-xl);
  }

  .game-over-score {
    font-size: var(--font-size-base);
  }
}
</style>