<template>
  <div class="game-view">
    <div class="container">
      <div class="game-header">
        <button @click="goBack" class="back-button">← 返回首页</button>
      </div>
      <div class="game-layout">
        <div class="game-main">
          <RPSGameBoard
            :is-playing="isPlaying"
            :player-choice="playerChoice"
            :computer-choice="computerChoice"
            :current-result="currentResult"
            @play="handlePlay"
            @play-again="handlePlayAgain"
          />
        </div>
        <div class="game-sidebar">
          <RPSScoreBoard
            :total-games="totalGames"
            :player-wins="playerWins"
            :computer-wins="computerWins"
            :draw-count="drawCount"
            :player-win-rate="playerWinRate"
            :game-history="gameHistory"
            @reset="handleReset"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 游戏视图组件
 * 石头剪刀布游戏主页面
 */

import { watchEffect, onUnmounted, onMounted } from 'vue';
import type { RPSChoice } from '@/types/game';
import RPSGameBoard from '@/components/games/RockPaperScissors/RPSGameBoard.vue';
import RPSScoreBoard from '@/components/games/RockPaperScissors/RPSScoreBoard.vue';
import { useRockPaperScissors } from '@/composables/useRockPaperScissors';

// 自动重置延迟时间（毫秒）
const AUTO_RESET_DELAY = 2000;

// 使用游戏逻辑
const {
  isPlaying,
  playerChoice,
  computerChoice,
  currentResult,
  playerWins,
  computerWins,
  drawCount,
  gameHistory,
  totalGames,
  playerWinRate,
  playRound,
  resetGame,
  resetAllStats,
} = useRockPaperScissors();

// 自动重置定时器
let autoResetTimer: number | null = null;

/**
 * 处理游戏回合
 */
function handlePlay(choice: RPSChoice): void {
  // 清除之前的定时器
  if (autoResetTimer !== null) {
    clearTimeout(autoResetTimer);
  }
  
  playRound(choice);
}

/**
 * 处理重置按钮点击
 */
function handleReset(): void {
  // 清除定时器
  if (autoResetTimer !== null) {
    clearTimeout(autoResetTimer);
    autoResetTimer = null;
  }
  resetAllStats();
}

/**
 * 处理再玩一次按钮点击
 */
function handlePlayAgain(): void {
  // 清除定时器
  if (autoResetTimer !== null) {
    clearTimeout(autoResetTimer);
    autoResetTimer = null;
  }
  resetGame();
}

/**
 * 返回首页
 */
function goBack(): void {
  // 直接关闭当前标签页
  window.close();
}

/**
 * 监听游戏结果变化，自动进入下一局
 */
watchEffect(() => {
  if (currentResult.value !== null) {
    // 清除之前的定时器
    if (autoResetTimer !== null) {
      clearTimeout(autoResetTimer);
    }
    
    // 设置自动重置定时器
    autoResetTimer = window.setTimeout(() => {
      resetGame();
      autoResetTimer = null;
    }, AUTO_RESET_DELAY);
  }
});

/**
 * 组件卸载时清理定时器
 */
onUnmounted(() => {
  if (autoResetTimer !== null) {
    clearTimeout(autoResetTimer);
  }
});

/**
 * 组件挂载时监听 BroadcastChannel
 */
onMounted(() => {
  const channel = new BroadcastChannel('woodcat-games');
  
  channel.onmessage = (event) => {
    const message = event.data;
    
    // 如果收到关闭消息，且不是当前游戏，则关闭当前标签页
    if (message.type === 'close-game' && message.gameRoute !== '/game/rock-paper-scissors') {
      channel.close();
      window.close();
    }
  };
  
  // 在组件卸载时清理
  onUnmounted(() => {
    channel.close();
  });
});
</script>

<style scoped>
/**
 * 游戏视图样式
 */

.game-view {
  min-height: calc(100vh - 8rem);
  padding: var(--spacing-8) 0;
}

.game-header {
  margin-bottom: var(--spacing-4);
}

.back-button {
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

.back-button:hover {
  background-color: var(--color-gray-100);
  border-color: var(--color-black);
}

.game-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: var(--spacing-8);
  align-items: start;
  transition: all var(--transition-slow);
}

.game-main {
  width: 100%;
}

.game-sidebar {
  position: sticky;
  top: 5rem;
}

/* 响应式设计 - 使用稳定的断点 */
@media (max-width: 1280px) {
  .game-layout {
    grid-template-columns: 1fr;
    gap: var(--spacing-6);
  }

  .game-sidebar {
    position: static;
  }
}

@media (max-width: 640px) {
  .game-view {
    padding: var(--spacing-4) 0;
  }

  .game-layout {
    gap: var(--spacing-4);
  }
}
</style>