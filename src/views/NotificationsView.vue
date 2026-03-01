<template>
  <div class="notifications-view">
    <div class="notifications-header">
      <h2 class="notifications-title">通知中心</h2>
      <button class="mark-read-button" @click="markAllAsRead" v-if="unreadCount > 0">
        全部标为已读
      </button>
    </div>

    <div class="notifications-list">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="notification-item"
        :class="{ 'notification-item--unread': !notification.read }"
        @click="handleNotificationClick(notification)"
      >
        <div class="notification-icon">{{ notification.icon }}</div>
        <div class="notification-content">
          <div class="notification-header">
            <h3 class="notification-title">{{ notification.title }}</h3>
            <span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
          </div>
          <p class="notification-body">{{ notification.body }}</p>
          <div v-if="notification.tags && notification.tags.length > 0" class="notification-tags">
            <span
              v-for="tag in notification.tags"
              :key="tag"
              class="notification-tag"
            >
              {{ tag }}
            </span>
          </div>
        </div>
        <div v-if="!notification.read" class="notification-indicator"></div>
      </div>

      <div v-if="notifications.length === 0" class="empty-state">
        <div class="empty-icon">📭</div>
        <p class="empty-text">暂无通知</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 通知视图组件
 */

import { computed } from 'vue';
import { useNotificationStore } from '@/stores/notificationStore';
import type { Notification } from '@/types/notification';

const notificationStore = useNotificationStore();

const notifications = computed(() => notificationStore.notifications);
const unreadCount = computed(() => notificationStore.unreadCount);

/**
 * 格式化时间
 */
function formatTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;

  const date = new Date(timestamp);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/**
 * 标记所有通知为已读
 */
function markAllAsRead(): void {
  notificationStore.markAllAsRead();
}

/**
 * 处理通知点击
 */
function handleNotificationClick(notification: Notification): void {
  if (!notification.read) {
    notificationStore.markAsRead(notification.id);
  }
}
</script>

<style scoped>
/**
 * 通知视图样式
 */

.notifications-view {
  background-color: var(--color-white);
  border: var(--border-width-thin) solid var(--color-gray-200);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.notifications-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-6);
  border-bottom: var(--border-width-thin) solid var(--color-gray-200);
}

.notifications-title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-black);
  margin: 0;
}

.mark-read-button {
  padding: var(--spacing-2) var(--spacing-4);
  background-color: var(--color-black);
  color: var(--color-white);
  font-size: var(--font-size-sm);
  font-weight: 600;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.mark-read-button:hover {
  background-color: var(--color-gray-800);
}

.notifications-list {
  display: flex;
  flex-direction: column;
}

.notification-item {
  display: flex;
  gap: var(--spacing-4);
  padding: var(--spacing-6);
  border-bottom: var(--border-width-thin) solid var(--color-gray-100);
  cursor: pointer;
  transition: background-color var(--transition-fast);
  position: relative;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-item:hover {
  background-color: var(--color-gray-50);
}

.notification-item--unread {
  background-color: var(--color-blue-50);
}

.notification-item--unread:hover {
  background-color: var(--color-blue-100);
}

.notification-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-2xl);
  background-color: var(--color-gray-100);
  border-radius: var(--radius-md);
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-2);
}

.notification-title {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-black);
  margin: 0;
  line-height: 1.4;
}

.notification-time {
  flex-shrink: 0;
  font-size: var(--font-size-xs);
  color: var(--color-gray-500);
  white-space: nowrap;
}

.notification-body {
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
  line-height: 1.6;
  margin: 0 0 var(--spacing-3) 0;
  white-space: pre-wrap;
}

.notification-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
}

.notification-tag {
  display: inline-block;
  padding: var(--spacing-1) var(--spacing-2);
  font-size: var(--font-size-xs);
  font-weight: 500;
  color: var(--color-gray-600);
  background-color: var(--color-gray-100);
  border-radius: var(--radius-sm);
}

.notification-indicator {
  position: absolute;
  top: var(--spacing-6);
  right: var(--spacing-6);
  width: 8px;
  height: 8px;
  background-color: var(--color-blue-600);
  border-radius: 50%;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-12);
  text-align: center;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: var(--spacing-4);
}

.empty-text {
  font-size: var(--font-size-base);
  color: var(--color-gray-500);
}

/* 响应式设计 */
@media (max-width: 640px) {
  .notifications-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-3);
  }

  .notification-item {
    padding: var(--spacing-4);
  }

  .notification-icon {
    width: 40px;
    height: 40px;
    font-size: var(--font-size-xl);
  }

  .notification-header {
    flex-direction: column;
    gap: var(--spacing-1);
  }

  .notification-time {
    align-self: flex-start;
  }
}
</style>