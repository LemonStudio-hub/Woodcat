<template>
  <div class="score-board">
    <div class="score-header">
      <h3 class="score-title">游戏统计</h3>
      <button class="reset-button" @click="handleReset" aria-label="重置统计">
        <span class="reset-icon">↺</span>
      </button>
    </div>

    <div class="score-stats">
      <div class="stat-item">
        <span class="stat-label">总场次</span>
        <span class="stat-value">{{ totalGames }}</span>
      </div>
      <div class="stat-item stat-item--win">
        <span class="stat-label">胜利</span>
        <span class="stat-value">{{ playerWins }}</span>
      </div>
      <div class="stat-item stat-item--lose">
        <span class="stat-label">失败</span>
        <span class="stat-value">{{ computerWins }}</span>
      </div>
      <div class="stat-item stat-item--draw">
        <span class="stat-label">平局</span>
        <span class="stat-value">{{ drawCount }}</span>
      </div>
    </div>

    <div class="win-rate">
      <span class="win-rate-label">胜率</span>
      <div class="win-rate-bar">
        <div
          class="win-rate-fill"
          :style="{ width: `${playerWinRate}%` }"
        ></div>
      </div>
      <span class="win-rate-value">{{ playerWinRate }}%</span>
    </div>

    <div v-if="gameHistory.length > 0" class="history-section">
      <h4 class="history-title">历史记录</h4>
      <ul class="history-list">
        <li
          v-for="(record, index) in gameHistory"
          :key="index"
          class="history-item"
        >
          <div class="history-choices">
            <span class="history-choice">{{ getChoiceLabel(record.playerChoice) }}</span>
            <span class="history-separator">vs</span>
            <span class="history-choice">{{ getChoiceLabel(record.computerChoice) }}</span>
          </div>
          <span
            class="history-result"
            :class="`history-result--${record.result}`"
          >
            {{ getResultLabel(record.result) }}
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 石头剪刀布计分板组件
 * 显示游戏统计数据和历史记录
 */

import type { RPSChoice, RPSResult } from '@/types/game';
import { RPS_CHOICE_MAP, RPS_RESULT_MAP } from '@/constants/gameConstants';

// 定义 Props
interface Props {
  totalGames: number;
  playerWins: number;
  computerWins: number;
  drawCount: number;
  playerWinRate: number;
  gameHistory: Array<{
    playerChoice: RPSChoice;
    computerChoice: RPSChoice;
    result: RPSResult;
    timestamp: number;
  }>;
}

const props = defineProps<Props>();

// 定义 Emits
interface Emits {
  (e: 'reset'): void;
}

const emit = defineEmits<Emits>();

/**
 * 处理重置按钮点击
 */
function handleReset(): void {
  emit('reset');
}

/**
 * 获取选项标签
 */
function getChoiceLabel(choice: RPSChoice): string {
  return RPS_CHOICE_MAP[choice].label;
}

/**
 * 获取结果标签
 */
function getResultLabel(result: RPSResult): string {
  return RPS_RESULT_MAP[result].label;
}
</script>

<style scoped>
/**
 * 计分板组件样式
 */

.score-board {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
  padding: var(--spacing-6);
  background-color: var(--color-white);
  border: var(--border-width-thin) solid var(--color-gray-200);
  border-radius: var(--radius-lg);
}

/* 头部 */
.score-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.score-title {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-black);
}

.reset-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background-color: var(--color-gray-100);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.reset-button:hover {
  background-color: var(--color-gray-200);
  transform: rotate(-180deg);
}

.reset-icon {
  font-size: var(--font-size-lg);
  color: var(--color-gray-600);
}

/* 统计数据 */
.score-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-4);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-3);
  background-color: var(--color-gray-100);
  border-radius: var(--radius-md);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--color-gray-500);
  font-weight: 600;
}

.stat-value {
  font-size: var(--font-size-xl);
  font-weight: 800;
  color: var(--color-black);
}

.stat-item--win .stat-value {
  color: var(--color-gray-800);
}

.stat-item--lose .stat-value {
  color: var(--color-gray-600);
}

.stat-item--draw .stat-value {
  color: var(--color-gray-400);
}

/* 胜率 */
.win-rate {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.win-rate-label {
  font-size: var(--font-size-sm);
  color: var(--color-gray-500);
  font-weight: 600;
}

.win-rate-bar {
  position: relative;
  height: 0.5rem;
  background-color: var(--color-gray-200);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.win-rate-fill {
  height: 100%;
  background-color: var(--color-black);
  transition: width var(--transition-slow);
}

.win-rate-value {
  align-self: flex-end;
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-black);
}

/* 历史记录 */
.history-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.history-title {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-black);
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  list-style: none;
}

.history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-2) var(--spacing-3);
  background-color: var(--color-gray-100);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
}

.history-choices {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.history-choice {
  font-weight: 600;
  color: var(--color-black);
}

.history-separator {
  font-size: var(--font-size-xs);
  color: var(--color-gray-400);
  font-weight: 700;
}

.history-result {
  font-weight: 700;
}

.history-result--win {
  color: var(--color-gray-800);
}

.history-result--lose {
  color: var(--color-gray-500);
}

.history-result--draw {
  color: var(--color-gray-400);
}

/* 响应式设计 */
@media (max-width: 640px) {
  .score-board {
    padding: var(--spacing-4);
    gap: var(--spacing-4);
  }

  .score-stats {
    gap: var(--spacing-2);
  }

  .stat-item {
    padding: var(--spacing-2);
  }

  .stat-value {
    font-size: var(--font-size-lg);
  }
}
</style>