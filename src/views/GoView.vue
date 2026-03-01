<template>
  <div class="go-view">
    <div class="view-header">
      <h1 class="view-title">围棋</h1>
      <p class="view-description">中国传统棋类游戏，黑方先手</p>
    </div>

    <GoBoard />
  </div>
</template>

<script setup lang="ts">
/**
 * 围棋视图页面
 */

import GoBoard from '@/components/games/Go/GoBoard.vue';
</script>

<style scoped>
.go-view {
  min-height: calc(100vh - 8rem);
  padding: var(--spacing-8) 0;
}

.view-header {
  text-align: center;
  margin-bottom: var(--spacing-6);
}

.view-title {
  font-size: var(--font-size-4xl);
  font-weight: 800;
  color: var(--color-black);
  margin-bottom: var(--spacing-2);
}

.view-description {
  font-size: var(--font-size-base);
  color: var(--color-gray-600);
}

@media (max-width: 640px) {
  .go-view {
    padding: var(--spacing-6) 0;
  }

  .view-title {
    font-size: var(--font-size-3xl);
  }
}
</style>