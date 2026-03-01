<template>
  <div class="community-view">
    <div class="container">
      <div class="community-header">
        <h1 class="community-title">社区</h1>
        <p class="community-subtitle">发现精彩内容，与志同道合的朋友交流</p>
      </div>

      <div class="community-content">
        <div class="community-sidebar">
          <div class="sidebar-section">
            <h2 class="sidebar-title">探索</h2>
            <nav class="sidebar-nav">
              <router-link
                to="/community/notifications"
                class="sidebar-link"
                :class="{ 'sidebar-link--active': $route.path === '/community/notifications' }"
              >
                <span class="sidebar-text">通知</span>
                <span v-if="unreadCount > 0" class="sidebar-badge">{{ unreadCount }}</span>
              </router-link>
              <router-link
                to="/community/games"
                class="sidebar-link"
                :class="{ 'sidebar-link--active': $route.path === '/community/games' }"
              >
                <span class="sidebar-text">游戏大厅</span>
              </router-link>
            </nav>
          </div>
        </div>

        <div class="community-main">
          <router-view />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 社区视图组件
 */

import { ref, computed, onMounted } from 'vue';
import { useNotificationStore } from '@/stores/notificationStore';

const notificationStore = useNotificationStore();

const unreadCount = computed(() => notificationStore.unreadCount);

onMounted(() => {
  notificationStore.loadNotifications();
});
</script>

<style scoped>
/**
 * 社区视图样式
 */

.community-view {
  min-height: calc(100vh - 8rem);
  padding: var(--spacing-8) 0;
}

.community-header {
  text-align: center;
  margin-bottom: var(--spacing-8);
}

.community-title {
  font-size: var(--font-size-4xl);
  font-weight: 800;
  color: var(--color-black);
  margin-bottom: var(--spacing-2);
}

.community-subtitle {
  font-size: var(--font-size-lg);
  color: var(--color-gray-600);
}

.community-content {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: var(--spacing-8);
  max-width: 1200px;
  margin: 0 auto;
}

.community-sidebar {
  position: sticky;
  top: 6rem;
  height: fit-content;
}

.sidebar-section {
  background-color: var(--color-white);
  border: var(--border-width-thin) solid var(--color-gray-200);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
}

.sidebar-title {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-gray-500);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--spacing-3);
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3) var(--spacing-4);
  font-size: var(--font-size-base);
  font-weight: 500;
  color: var(--color-gray-700);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  text-decoration: none;
  position: relative;
}

.sidebar-link:hover {
  background-color: var(--color-gray-100);
  color: var(--color-black);
}

.sidebar-link--active {
  background-color: var(--color-black);
  color: var(--color-white);
  font-weight: 600;
}

.sidebar-text {
  flex: 1;
}

.sidebar-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 var(--spacing-1);
  background-color: var(--color-red-600);
  color: var(--color-white);
  font-size: var(--font-size-xs);
  font-weight: 600;
  border-radius: 10px;
}

.community-main {
  min-height: 400px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .community-content {
    grid-template-columns: 1fr;
    gap: var(--spacing-4);
  }

  .community-sidebar {
    position: static;
  }

  .sidebar-nav {
    flex-direction: row;
    overflow-x: auto;
    padding-bottom: var(--spacing-2);
  }

  .sidebar-link {
    white-space: nowrap;
  }
}
</style>