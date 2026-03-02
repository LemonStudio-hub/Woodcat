<template>
  <div class="adarkroom-view">
    <div class="adarkroom-header">
      <h2 class="adarkroom-title">A Dark Room</h2>
      <p class="adarkroom-subtitle">极简主义文字冒险游戏</p>
      <p class="adarkroom-attribution">
        原作者: Michael Townsend & doublespeakgames
        <a href="https://github.com/doublespeakgames/adarkroom" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
      </p>
    </div>

    <div class="adarkroom-container">
      <iframe
        src="/adarkroom/index.html"
        class="adarkroom-iframe"
        title="A Dark Room Game"
        frameborder="0"
        allowfullscreen
        sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
      ></iframe>
    </div>
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
</script>

<style scoped>
/**
 * A Dark Room 视图样式
 */

.adarkroom-view {
  display: flex;
  flex-direction: column;
  background-color: var(--color-white);
  border: var(--border-width-thin) solid var(--color-gray-200);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.adarkroom-header {
  padding: var(--spacing-6);
  border-bottom: var(--border-width-thin) solid var(--color-gray-200);
}

.adarkroom-title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-black);
  margin: 0 0 var(--spacing-2) 0;
}

.adarkroom-subtitle {
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
  margin: 0 0 var(--spacing-3) 0;
}

.adarkroom-attribution {
  font-size: var(--font-size-xs);
  color: var(--color-gray-500);
  margin: 0;
}

.adarkroom-attribution a {
  color: var(--color-gray-600);
  text-decoration: none;
}

.adarkroom-attribution a:hover {
  text-decoration: underline;
}

.adarkroom-container {
  flex: 1;
  background-color: #000;
  min-height: 600px;
}

.adarkroom-iframe {
  width: 100%;
  height: 100%;
  min-height: 600px;
  border: none;
  display: block;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .adarkroom-header {
    padding: var(--spacing-4);
  }

  .adarkroom-title {
    font-size: var(--font-size-lg);
  }

  .adarkroom-subtitle {
    font-size: var(--font-size-xs);
  }

  .adarkroom-container {
    min-height: 500px;
  }

  .adarkroom-iframe {
    min-height: 500px;
  }
}
</style>