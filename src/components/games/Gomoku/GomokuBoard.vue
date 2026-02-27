<template>
  <div class="gomoku-game">
    <div class="game-header">
      <div class="score-info">
        <div class="score-item">
          <span class="score-label">黑子</span>
          <span class="score-value">{{ blackWins }}</span>
        </div>
        <div class="score-item">
          <span class="score-label">白子</span>
          <span class="score-value">{{ whiteWins }}</span>
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
              v-for="i in 15"
              :key="`h-${i}`"
              class="grid-line grid-line-horizontal"
              :style="{ top: `${((i - 1) / 14) * 100}%` }"
            ></div>
            <div
              v-for="i in 15"
              :key="`v-${i}`"
              class="grid-line grid-line-vertical"
              :style="{ left: `${((i - 1) / 14) * 100}%` }"
            ></div>
          </div>
          
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
                  'stone-winning': isInWinningLine(rowIndex, colIndex)
                }"
              ></div>
            </div>
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
 * 五子棋游戏棋盘组件
 * 显示游戏棋盘和棋子
 */

import { onMounted } from 'vue';
import { useGomokuGame } from '@/composables/useGomokuGame';
import { Player, GameState } from '@/constants/gomokuConstants';

// 使用游戏逻辑
const {
  board,
  gameState,
  blackWins,
  whiteWins,
  winningLine,
  statusText,
  placePiece,
  startNewGame,
  resetAllStats,
  initBoard,
} = useGomokuGame();

/**
 * 检查位置是否在获胜连线上
 */
function isInWinningLine(row: number, col: number): boolean {
  return winningLine.value.some(pos => pos.row === row && pos.col === col);
}

/**
 * 获取交叉点样式
 */
function getIntersectionStyle(row: number, col: number): Record<string, string> {
  return {
    left: `${3 + (col / 14) * 94}%`,
    top: `${3 + (row / 14) * 94}%`,
    transform: 'translate(-50%, -50%)',
  };
}

/**
 * 处理单元格点击
 */
function handleCellClick(row: number, col: number): void {
  placePiece(row, col);
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

// 组件挂载时初始化棋盘（如果棋盘为空）
onMounted(() => {
  // 如果棋盘为空，只初始化棋盘，不重新初始化游戏状态
  if (board.value.length === 0) {
    initBoard();
  }
});
</script>

<style scoped>
/**
 * 五子棋游戏棋盘组件样式
 */

.gomoku-game {
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
  inset: 3%;
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

/* 交叉点（点击区域和棋子位置） */
.intersection {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 8%;
  height: 8%;
  cursor: pointer;
  transition: all var(--transition-fast);
  z-index: 10;
}

.intersection:hover::before {
  content: '';
  position: absolute;
  width: 50%;
  height: 50%;
  background: radial-gradient(circle, rgba(0, 0, 0, 0.15) 0%, transparent 70%);
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
  width: 80%;
  height: 80%;
  border-radius: 50%;
  z-index: 20;
  animation: stoneDropIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes stoneDropIn {
  0% {
    transform: scale(0) translateY(-50%);
    opacity: 0;
  }
  50% {
    transform: scale(1.1) translateY(0);
    opacity: 1;
  }
  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
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
  background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  animation: stoneShine 2s ease-in-out infinite;
}

@keyframes stoneShine {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.1);
  }
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
  animation: stoneShine 2s ease-in-out infinite 0.5s;
}

/* 获胜连线棋子高亮 */
.stone-winning {
  animation: winningPulse 1s ease-in-out infinite;
  position: relative;
}

.stone-winning::before {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
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
  filter: blur(3px);
}

.stone-winning.stone-black::before {
  background: conic-gradient(
    from 0deg,
    #ff4757,
    #ffa502,
    #2ed573,
    #1e90ff,
    #ff4757
  );
}

.stone-winning.stone-white::before {
  background: conic-gradient(
    from 0deg,
    #e74c3c,
    #f39c12,
    #27ae60,
    #3498db,
    #e74c3c
  );
}

@keyframes winningPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.15);
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

  .game-over-buttons {
    flex-direction: column;
  }
}
</style>