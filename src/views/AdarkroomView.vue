<template>
  <div class="adarkroom-view">
    <div class="adarkroom-container">
      <iframe
        ref="iframeRef"
        src="/adarkroom/index.html"
        class="adarkroom-iframe"
        title="A Dark Room Game"
        frameborder="0"
        allowfullscreen
        sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
      ></iframe>
    </div>
    
    <button 
      v-if="!isFullscreen" 
      @click="enterFullscreen" 
      class="fullscreen-btn"
      title="全屏体验"
    >
      ⛶
    </button>
  </div>
</template>

<script setup lang="ts">
/**
 * A Dark Room 视图组件
 * 通过 iframe 隔离加载第三方游戏
 * 
 * 版权声明：
 * 本游戏由 doublespeakgames 开发，遵循 Mozilla Public License 2.0
 * 项目地址: https://github.com/doublespeakgames/adarkroom
 */

import { ref, onMounted, onUnmounted } from 'vue';

const iframeRef = ref<HTMLIFrameElement>();
const isFullscreen = ref(false);
let headerElement: HTMLElement | null = null;
let footerElement: HTMLElement | null = null;

/**
 * 进入全屏模式
 */
function enterFullscreen(): void {
  if (iframeRef.value) {
    iframeRef.value.requestFullscreen().catch(err => {
      console.error('全屏请求失败:', err);
    });
  }
}

/**
 * 退出全屏模式
 */
function exitFullscreen(): void {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  }
}

/**
 * 监听全屏变化
 */
function handleFullscreenChange(): void {
  isFullscreen.value = !!document.fullscreenElement;
  
  if (isFullscreen.value) {
    hideNavigation();
  } else {
    showNavigation();
  }
}

/**
 * 隐藏导航栏和页脚
 */
function hideNavigation(): void {
  headerElement = document.querySelector('header');
  footerElement = document.querySelector('footer');
  
  if (headerElement) {
    headerElement.style.display = 'none';
  }
  if (footerElement) {
    footerElement.style.display = 'none';
  }
  
  document.body.style.overflow = 'hidden';
}

/**
 * 显示导航栏和页脚
 */
function showNavigation(): void {
  if (headerElement) {
    headerElement.style.display = '';
  }
  if (footerElement) {
    footerElement.style.display = '';
  }
  
  document.body.style.overflow = '';
}

/**
 * 按 ESC 键退出全屏
 */
function handleKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape' && isFullscreen.value) {
    exitFullscreen();
  }
}

onMounted(() => {
  // 自动进入全屏
  setTimeout(() => {
    enterFullscreen();
  }, 500);
  
  // 监听全屏变化
  document.addEventListener('fullscreenchange', handleFullscreenChange);
  
  // 监听键盘事件
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  // 恢复导航栏显示
  showNavigation();
  
  // 退出全屏
  exitFullscreen();
  
  // 移除事件监听
  document.removeEventListener('fullscreenchange', handleFullscreenChange);
  document.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
/**
 * A Dark Room 视图样式
 */

.adarkroom-view {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #000;
  z-index: 9999;
}

.adarkroom-container {
  width: 100%;
  height: 100%;
}

.adarkroom-iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}

.fullscreen-btn {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 50px;
  height: 50px;
  background-color: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.7);
  font-size: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fullscreen-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
  color: rgba(255, 255, 255, 1);
  transform: scale(1.1);
}

/* 全屏时隐藏按钮 */
:deep(body:fullscreen) .fullscreen-btn,
:deep(body:-webkit-full-screen) .fullscreen-btn,
:deep(body:-moz-full-screen) .fullscreen-btn,
:deep(body:-ms-fullscreen) .fullscreen-btn {
  display: none;
}
</style>