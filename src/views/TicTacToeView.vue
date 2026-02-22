<template>
  <div class="tictactoe-view">
    <div class="container">
      <div class="game-header">
        <button @click="goBack" class="back-button">← 返回首页</button>
      </div>

      <!-- 游戏模式选择器 -->
      <div v-if="!gameStarted" class="mode-selector">
        <div class="mode-selector-content">
          <div class="mode-selector-title">选择游戏模式</div>
          <div class="mode-buttons">
            <button
              class="mode-button"
              :class="{ 'mode-button--active': gameMode === GameMode.PVP }"
              @click="handleModeSelect(GameMode.PVP)"
            >
              <div class="mode-icon">👥</div>
              <div class="mode-name">双人对战</div>
              <div class="mode-desc">两个玩家轮流下棋</div>
            </button>
            <button
              class="mode-button"
              :class="{ 'mode-button--active': gameMode === GameMode.PVE }"
              @click="handleModeSelect(GameMode.PVE)"
            >
              <div class="mode-icon">🤖</div>
              <div class="mode-name">人机对战</div>
              <div class="mode-desc">与AI对战，挑战智能AI</div>
            </button>
          </div>
          <div v-if="gameMode === GameMode.PVE" class="first-player-info">
            <div class="first-player-icon">🎲</div>
            <div class="first-player-text">{{ firstPlayerText }}</div>
          </div>
          <button class="start-game-button" @click="handleStartGame">
            开始游戏
          </button>
        </div>
      </div>

      <!-- 游戏区域 -->
      <div v-else class="game-layout">
        <div class="game-main">
          <TicTacToeBoard />
        </div>
      </div>
    </div>
  </div>

  <!-- 棋色提示 -->
  <Transition name="fade">
    <div v-if="showColorHint" class="color-hint-overlay">
      <div class="color-hint-content">
        <div class="color-hint-icon">{{ playerColorIcon }}</div>
        <div class="color-hint-text">{{ playerColorText }}</div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
/**
 * 井字棋游戏视图组件
 * 井字棋游戏主页面
 */

import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import TicTacToeBoard from '@/components/games/TicTacToe/TicTacToeBoard.vue';
import { useTicTacToeGame } from '@/composables/useTicTacToeGame';
import { GameMode, Cell } from '@/constants/ticTacToeConstants';

// 路由实例
const router = useRouter();

// 使用游戏逻辑
const {
  gameMode,
  aiPlayer,
  startNewGame,
} = useTicTacToeGame();

/**
 * 游戏是否开始
 */
const gameStarted = ref<boolean>(false);

/**
 * 是否显示棋色提示
 */
const showColorHint = ref<boolean>(false);

/**
 * 先手信息
 */
const firstPlayerText = computed((): string => {
  if (gameMode.value !== GameMode.PVE) return 'X先手';
  if (!aiPlayer.value) return 'X先手';
  return aiPlayer.value === Cell.X ? 'AI先手（X）' : '你先手（X）';
});

/**
 * 玩家棋色图标
 */
const playerColorIcon = computed((): string => {
  if (gameMode.value !== GameMode.PVE || !aiPlayer.value) return 'X';
  return aiPlayer.value === Cell.O ? 'X' : 'O';
});

/**
 * 玩家棋色文本
 */
const playerColorText = computed((): string => {
  if (gameMode.value !== GameMode.PVE) return '双人对战模式';
  if (!aiPlayer.value) return '双人对战模式';
  return aiPlayer.value === Cell.O ? '你执X（先手）' : '你执O（后手）';
});

/**
 * 处理游戏模式选择
 */
function handleModeSelect(mode: GameMode): void {
  gameMode.value = mode;
}

/**
 * 处理开始游戏
 */
function handleStartGame(): void {
  gameStarted.value = true;
  startNewGame();

  // 人机对战模式下显示棋色提示
  if (gameMode.value === GameMode.PVE) {
    showColorHint.value = true;
    setTimeout(() => {
      showColorHint.value = false;
    }, 3000);
  }
}

/**
 * 返回首页
 */
function goBack(): void {
  router.push('/');
}

/**
 * 组件挂载时监听 BroadcastChannel
 */
onMounted(() => {
  const channel = new BroadcastChannel('woodcat-games');

  channel.onmessage = (event) => {
    const message = event.data;

    // 如果收到关闭消息，且不是当前游戏，则关闭当前标签页
    if (message.type === 'close-game' && message.gameRoute !== '/game/tictactoe') {
      channel.close();
      window.close();
    }
  };

  // 在组件卸载时清理
  onUnmounted(() => {
    channel.close();
  });
});
</script>

<style scoped>
/**
 * 井字棋游戏视图样式
 */

.tictactoe-view {
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
  max-width: 700px;
  margin: 0 auto;
}

.game-main {
  width: 100%;
}

/* 游戏模式选择器 */
.mode-selector {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
}

.mode-selector-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-8);
  padding: var(--spacing-10);
  background-color: var(--color-white);
  border: var(--border-width-medium) solid var(--color-gray-200);
  border-radius: var(--radius-xl);
  max-width: 600px;
  width: 100%;
}

.mode-selector-title {
  font-size: var(--font-size-3xl);
  font-weight: 800;
  color: var(--color-black);
  text-align: center;
}

.mode-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-6);
  width: 100%;
}

.mode-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-6);
  background-color: var(--color-white);
  border: var(--border-width-medium) solid var(--color-gray-200);
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);
  cursor: pointer;
}

.mode-button:hover {
  border-color: var(--color-black);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.mode-button--active {
  background-color: var(--color-black);
  border-color: var(--color-black);
}

.mode-button--active .mode-icon,
.mode-button--active .mode-name,
.mode-button--active .mode-desc {
  color: var(--color-white);
}

.mode-icon {
  font-size: 3rem;
}

.mode-name {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-black);
}

.mode-desc {
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
  text-align: center;
}

.first-player-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-4) var(--spacing-6);
  background-color: var(--color-gray-100);
  border-radius: var(--radius-md);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.first-player-icon {
  font-size: 1.5rem;
}

.first-player-text {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-black);
}

.start-game-button {
  padding: var(--spacing-4) var(--spacing-12);
  background-color: var(--color-black);
  color: var(--color-white);
  font-size: var(--font-size-lg);
  font-weight: 700;
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);
  border: none;
  cursor: pointer;
  box-shadow: var(--shadow-lg);
}

.start-game-button:hover {
  background-color: var(--color-gray-800);
  transform: translateY(-2px);
  box-shadow: var(--shadow-xl);
}

.start-game-button:active {
  transform: translateY(0);
}

/* 棋色提示 */
.color-hint-overlay {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
}

.color-hint-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-8) var(--spacing-10);
  background-color: var(--color-white);
  border: var(--border-width-thick) solid var(--color-black);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-2xl);
}

.color-hint-icon {
  font-size: 4rem;
  animation: bounce 0.5s ease;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.color-hint-text {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-black);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .tictactoe-view {
    padding: var(--spacing-4) 0;
  }

  .mode-selector-content {
    padding: var(--spacing-6);
    gap: var(--spacing-6);
  }

  .mode-selector-title {
    font-size: var(--font-size-2xl);
  }

  .mode-buttons {
    grid-template-columns: 1fr;
    gap: var(--spacing-4);
  }

  .mode-button {
    padding: var(--spacing-4);
  }

  .mode-icon {
    font-size: 2.5rem;
  }

  .mode-name {
    font-size: var(--font-size-base);
  }

  .mode-desc {
    font-size: var(--font-size-xs);
  }

  .start-game-button {
    padding: var(--spacing-3) var(--spacing-8);
    font-size: var(--font-size-base);
  }
}
</style>