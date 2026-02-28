<template>
  <div class="app">
    <TheHeader />
    <main class="main">
      <ErrorBoundary>
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </ErrorBoundary>
    </main>
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
/**
 * 主应用组件
 * 应用程序的根组件
 */

import TheHeader from '@/components/common/TheHeader.vue';
import TheFooter from '@/components/common/TheFooter.vue';
import ErrorBoundary from '@/components/common/ErrorBoundary.vue';

// 全局错误处理
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});
</script>

<style scoped>
/**
 * 应用根组件样式
 */

.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main {
  flex: 1;
}

/* 页面切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-base);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>