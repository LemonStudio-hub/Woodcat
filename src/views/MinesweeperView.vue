<template>
  <div class="minesweeper-view">
    <div class="container">
      <div class="game-header">
        <button @click="goBack" class="back-button">← 返回首页</button>
      </div>

      <div class="game-layout">
        <div class="game-main">
          <MinesweeperBoard />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 扫雷游戏视图组件
 * 扫雷游戏主页面
 */

import { useRouter } from 'vue-router';
import MinesweeperBoard from '@/components/games/Minesweeper/MinesweeperBoard.vue';

// 路由实例
const router = useRouter();

/**
 * 返回首页
 */
function goBack(): void {
  router.push('/');
}
</script>

<style scoped>
/**
 * 扫雷游戏视图样式
 */

.minesweeper-view {
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
  max-width: 800px;
  margin: 0 auto;
}

.game-main {
  width: 100%;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .minesweeper-view {
    padding: var(--spacing-4) 0;
  }
}
</style>