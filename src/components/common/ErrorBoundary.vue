<template>
  <div v-if="hasError" class="error-boundary">
    <div class="error-content">
      <div class="error-icon">⚠️</div>
      <h1 class="error-title">出错了</h1>
      <p class="error-message">应用遇到了一些问题，请刷新页面重试。</p>
      
      <div v-if="showDetails && errorInfo" class="error-details">
        <h3>错误详情</h3>
        <pre class="error-stack">{{ errorInfo.toString() }}</pre>
        <pre v-if="errorComponentStack" class="error-stack">{{ errorComponentStack }}</pre>
      </div>
      
      <div class="error-actions">
        <button @click="handleReload" class="error-button error-button--primary">
          刷新页面
        </button>
        <button @click="toggleDetails" class="error-button">
          {{ showDetails ? '隐藏详情' : '显示详情' }}
        </button>
      </div>
    </div>
  </div>
  <slot v-else></slot>
</template>

<script setup lang="ts">
/**
 * 全局错误边界组件
 * 捕获子组件中的错误并提供友好的错误提示
 */

import { ref, onErrorCaptured, onUnmounted } from 'vue';

const hasError = ref(false);
const errorInfo = ref<Error | null>(null);
const errorComponentStack = ref<string>('');
const showDetails = ref(false);

// 捕获子组件错误
onErrorCaptured((err: Error, instance, info) => {
  console.error('ErrorBoundary caught an error:', err);
  console.error('Component stack:', info);
  
  hasError.value = true;
  errorInfo.value = err;
  errorComponentStack.value = info;
  
  // 返回 false 阻止错误继续向上传播
  return false;
});

/**
 * 刷新页面
 */
function handleReload(): void {
  window.location.reload();
}

/**
 * 切换显示/隐藏错误详情
 */
function toggleDetails(): void {
  showDetails.value = !showDetails.value;
}

/**
 * 组件卸载时清理
 */
onUnmounted(() => {
  hasError.value = false;
  errorInfo.value = null;
  errorComponentStack.value = '';
});
</script>

<style scoped>
.error-boundary {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 8rem);
  padding: var(--spacing-6);
  background-color: var(--color-gray-50);
}

.error-content {
  max-width: 500px;
  padding: var(--spacing-8);
  background-color: var(--color-white);
  border: var(--border-width-thin) solid var(--color-gray-200);
  border-radius: var(--radius-lg);
  text-align: center;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: var(--spacing-4);
}

.error-title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--color-black);
  margin-bottom: var(--spacing-2);
}

.error-message {
  font-size: var(--font-size-base);
  color: var(--color-gray-600);
  margin-bottom: var(--spacing-6);
}

.error-details {
  margin-top: var(--spacing-6);
  padding: var(--spacing-4);
  background-color: var(--color-gray-50);
  border: var(--border-width-thin) solid var(--color-gray-200);
  border-radius: var(--radius-md);
  text-align: left;
}

.error-details h3 {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-gray-700);
  margin-bottom: var(--spacing-2);
}

.error-stack {
  font-size: var(--font-size-xs);
  color: var(--color-gray-600);
  background-color: var(--color-gray-100);
  padding: var(--spacing-2);
  border-radius: var(--radius-sm);
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
  margin-bottom: var(--spacing-2);
}

.error-actions {
  display: flex;
  gap: var(--spacing-3);
  justify-content: center;
  margin-top: var(--spacing-6);
}

.error-button {
  padding: var(--spacing-3) var(--spacing-6);
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-black);
  background-color: var(--color-white);
  border: var(--border-width-thin) solid var(--color-gray-300);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.error-button:hover {
  background-color: var(--color-gray-100);
  border-color: var(--color-gray-400);
}

.error-button--primary {
  color: var(--color-white);
  background-color: var(--color-black);
  border-color: var(--color-black);
}

.error-button--primary:hover {
  background-color: var(--color-gray-800);
  border-color: var(--color-gray-800);
}
</style>