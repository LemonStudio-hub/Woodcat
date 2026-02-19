<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <p class="footer-text">© 2026 木头猫 Woodcat. 极简黑白风格小游戏合集</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
/**
 * 页脚组件
 * 显示版权信息
 */
</script>

<style scoped>
/**
 * 页脚组件样式
 */

.footer {
  background-color: var(--color-black);
  color: var(--color-white);
  padding: var(--spacing-6) 0;
  margin-top: auto;
}

.footer-content {
  text-align: center;
}

.footer-text {
  font-size: var(--font-size-sm);
  color: var(--color-gray-400);
  letter-spacing: 0.05em;
}

@media (max-width: 640px) {
  .footer {
    padding: var(--spacing-4) 0;
  }

  .footer-text {
    font-size: var(--font-size-xs);
  }
}
</style>