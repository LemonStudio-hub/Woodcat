<template>
  <div class="settings-view">
    <div class="container">
      <div class="settings-header">
        <h1 class="settings-title">设置</h1>
      </div>

      <div class="settings-content">
        <!-- 音效设置 -->
        <div class="setting-section">
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-details">
                <div class="setting-name">音效</div>
                <div class="setting-description">开启或关闭游戏音效</div>
              </div>
            </div>
            <button
              class="setting-toggle"
              :class="{ 'setting-toggle--active': soundEnabled }"
              @click="toggleSound"
              :aria-label="soundEnabled ? '关闭音效' : '开启音效'"
            >
              <span class="toggle-slider"></span>
            </button>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-details">
                <div class="setting-name">震动</div>
                <div class="setting-description">开启或关闭游戏震动反馈</div>
              </div>
            </div>
            <button
              class="setting-toggle"
              :class="{ 'setting-toggle--active': vibrationEnabled }"
              @click="toggleVibration"
              :aria-label="vibrationEnabled ? '关闭震动' : '开启震动'"
            >
              <span class="toggle-slider"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 设置视图组件
 * 允许用户配置游戏设置
 */

import { ref, onMounted } from 'vue';
import { audioService, SoundType } from '@/services/audioService';
import { vibrationService, VibrationType } from '@/services/vibrationService';

/**
 * 音效是否启用
 */
const soundEnabled = ref(audioService.isEnabled());

/**
 * 震动是否启用
 */
const vibrationEnabled = ref(vibrationService.isEnabled());

/**
 * 切换音效
 */
function toggleSound(): void {
  soundEnabled.value = audioService.toggle();
  // 播放测试音效
  if (soundEnabled.value) {
    audioService.play(SoundType.CLICK);
  }
}

/**
 * 切换震动
 */
function toggleVibration(): void {
  vibrationEnabled.value = vibrationService.toggle();
  // 测试震动
  if (vibrationEnabled.value) {
    vibrationService.vibrate(VibrationType.CLICK);
  }
}

/**
 * 组件挂载时同步状态
 */
onMounted(() => {
  soundEnabled.value = audioService.isEnabled();
  vibrationEnabled.value = vibrationService.isEnabled();
});
</script>

<style scoped>
/**
 * 设置视图样式
 */

.settings-view {
  min-height: calc(100vh - 8rem);
  padding: var(--spacing-8) 0;
}

.settings-header {
  margin-bottom: var(--spacing-8);
}

.settings-title {
  font-size: var(--font-size-3xl);
  font-weight: 800;
  color: var(--color-black);
  text-align: center;
}

.settings-content {
  max-width: 600px;
  margin: 0 auto;
}

/* 设置区块 */
.setting-section {
  background-color: var(--color-white);
  border: var(--border-width-medium) solid var(--color-gray-200);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

/* 设置项 */
.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-6);
  border-bottom: var(--border-width-thin) solid var(--color-gray-100);
  transition: background-color var(--transition-fast);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-item:hover {
  background-color: var(--color-gray-50);
}

/* 设置信息 */
.setting-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
}

.setting-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.setting-name {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-black);
}

.setting-description {
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
}

/* 切换开关 */
.setting-toggle {
  position: relative;
  width: 52px;
  height: 28px;
  background-color: var(--color-gray-300);
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.setting-toggle:hover {
  background-color: var(--color-gray-400);
}

.setting-toggle--active {
  background-color: var(--color-black);
}

.setting-toggle--active:hover {
  background-color: var(--color-gray-800);
}

.toggle-slider {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 24px;
  height: 24px;
  background-color: var(--color-white);
  border-radius: var(--radius-full);
  transition: transform var(--transition-fast);
  box-shadow: var(--shadow-sm);
}

.setting-toggle--active .toggle-slider {
  transform: translateX(24px);
}

/* 响应式设计 */
@media (max-width: 640px) {
  .settings-view {
    padding: var(--spacing-4) 0;
  }

  .settings-header {
    margin-bottom: var(--spacing-6);
  }

  .settings-title {
    font-size: var(--font-size-2xl);
  }

  .settings-content {
    max-width: 100%;
  }

  .setting-item {
    padding: var(--spacing-4);
  }

  .setting-name {
    font-size: var(--font-size-base);
  }

  .setting-description {
    font-size: var(--font-size-xs);
  }

  .setting-toggle {
    width: 44px;
    height: 24px;
  }

  .toggle-slider {
    width: 20px;
    height: 20px;
  }

  .setting-toggle--active .toggle-slider {
    transform: translateX(20px);
  }
}
</style>