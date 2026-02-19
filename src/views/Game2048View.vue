<template>
  <div class="game2048-view">
    <div class="container">
      <div class="game-header">
        <button @click="goBack" class="back-button">← 返回首页</button>
      </div>
      <div class="game-layout">
        <div class="game-main">
          <Game2048Board
            :tiles="tiles"
            :score="score"
            :best-score="bestScore"
            :game-over="gameOver"
            :game-won="gameWon"
            :status-text="statusText"
            @move="handleMove"
            @restart="handleRestart"
            @continue="handleContinue"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 2048 游戏视图组件
 * 2048 游戏主页面
 */

import { onMounted, onUnmounted } from 'vue';
import Game2048Board from '@/components/games/Game2048/Game2048Board.vue';
import { use2048Game } from '@/composables/use2048Game';

// 使用游戏逻辑
const {
  tiles,
  score,
  bestScore,
  gameOver,
  gameWon,
  statusText,
  initGame,
  move,
  restartGame,
} = use2048Game();

/**
 * 处理移动
 */
function handleMove(direction: 'up' | 'down' | 'left' | 'right'): void {
  move(direction as any);
}

/**
 * 处理重新开始
 */
function handleRestart(): void {
  restartGame();
}

/**
 * 处理继续游戏
 */
function handleContinue(): void {
  // 清除获胜状态，允许继续游戏
  // 这里需要在 use2048Game 中添加相应的方法
  restartGame();
}

/**
 * 返回首页
 */
function goBack(): void {
  // 直接关闭当前标签页
  window.close();
}

// 组件挂载时初始化游戏
onMounted(() => {
  initGame();
  
  // 监听 BroadcastChannel
  const channel = new BroadcastChannel('woodcat-games');
  
  channel.onmessage = (event) => {
    const message = event.data;
    
    // 如果收到关闭消息，且不是当前游戏，则关闭当前标签页
    if (message.type === 'close-game' && message.gameRoute !== '/game/2048') {
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
 * 2048 游戏视图样式
 */

.game2048-view {
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
  display: flex;
  justify-content: center;
  max-width: 600px;
  margin: 0 auto;
}

.game-main {
  width: 100%;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .game2048-view {
    padding: var(--spacing-4) 0;
  }
}
</style>