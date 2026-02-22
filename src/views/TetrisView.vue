<template>
  <div class="tetris-view">
    <div class="container">
      <div class="game-header">
        <button @click="goBack" class="back-button">← 返回首页</button>
      </div>
      
      <!-- 游戏区域 -->
      <div class="game-layout">
        <div class="game-main">
          <TetrisBoard />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 俄罗斯方块游戏视图组件
 * 俄罗斯方块游戏主页面
 */

import { onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import TetrisBoard from '@/components/games/Tetris/TetrisBoard.vue';

// 路由实例
const router = useRouter();

/**
 * 返回首页
 */
function goBack(): void {
  router.push('/');
}

/**
 * 组件挂载时监听 BroadcastChannel
 */
onMounted(() => {
  const channel = new BroadcastChannel('woodcat-games');
  
  channel.onmessage = (event) => {
    const message = event.data;
    
    // 如果收到关闭消息，且不是当前游戏，则关闭当前标签页
    if (message.type === 'close-game' && message.gameRoute !== '/game/tetris') {
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
 * 俄罗斯方块游戏视图样式
 */

.tetris-view {
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
  max-width: 700px;
  margin: 0 auto;
}

.game-main {
  width: 100%;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .tetris-view {
    padding: var(--spacing-4) 0;
  }
}
</style>