<template>
  <div class="international-checkers-view">
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
              <div class="mode-desc">白色 vs 黑色</div>
            </button>
            <button
              class="mode-button"
              :class="{ 'mode-button--active': gameMode === GameMode.PVE }"
              @click="handleModeSelect(GameMode.PVE)"
            >
              <div class="mode-icon">🤖</div>
              <div class="mode-name">人机对战</div>
              <div class="mode-desc">与AI对战</div>
            </button>
          </div>

          <!-- AI难度选择 -->
          <div v-if="gameMode === GameMode.PVE" class="ai-difficulty-selector">
            <div class="difficulty-label">AI 难度</div>
            <div class="difficulty-buttons">
              <button
                class="difficulty-button"
                :class="{ 'difficulty-button--active': aiDifficulty === AIDifficulty.EASY }"
                @click="handleDifficultySelect(AIDifficulty.EASY)"
              >
                简单
              </button>
              <button
                class="difficulty-button"
                :class="{ 'difficulty-button--active': aiDifficulty === AIDifficulty.MEDIUM }"
                @click="handleDifficultySelect(AIDifficulty.MEDIUM)"
              >
                中等
              </button>
              <button
                class="difficulty-button"
                :class="{ 'difficulty-button--active': aiDifficulty === AIDifficulty.HARD }"
                @click="handleDifficultySelect(AIDifficulty.HARD)"
              >
                困难
              </button>
            </div>
          </div>

          <button class="start-game-button" @click="handleStartGame">
            开始游戏
          </button>
        </div>
      </div>

      <!-- 游戏区域 -->
      <div v-else class="game-layout">
        <div class="game-main">
          <InternationalCheckersBoard />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 国际跳棋游戏视图组件
 * 国际跳棋游戏主页面
 */

import { ref } from 'vue';
import { useRouter } from 'vue-router';
import InternationalCheckersBoard from '@/components/games/InternationalCheckers/InternationalCheckersBoard.vue';
import { useInternationalCheckersGame } from '@/composables/useInternationalCheckersGame';
import { GameMode, AIDifficulty } from '@/constants/internationalCheckersConstants';

// 路由实例
const router = useRouter();

// 使用游戏逻辑
const {
  gameMode,
  aiDifficulty,
  startNewGame,
  setAIDifficulty,
} = useInternationalCheckersGame();

/**
 * 游戏是否开始
 */
const gameStarted = ref<boolean>(false);

/**
 * 处理游戏模式选择
 */
function handleModeSelect(mode: GameMode): void {
  gameMode.value = mode;
}

/**
 * 处理AI难度选择
 */
function handleDifficultySelect(difficulty: AIDifficulty): void {
  aiDifficulty.value = difficulty;
  setAIDifficulty(difficulty);
}

/**
 * 处理开始游戏
 */
function handleStartGame(): void {
  gameStarted.value = true;
  startNewGame();
}

/**
 * 返回首页
 */
function goBack(): void {
  router.push('/');
}
</script>

<style scoped>
/**
 * 国际跳棋游戏视图样式
 */

.international-checkers-view {
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
  max-width: 600px;
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

/* AI难度选择器 */
.ai-difficulty-selector {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-4);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.difficulty-label {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-gray-600);
}

.difficulty-buttons {
  display: flex;
  gap: var(--spacing-3);
}

.difficulty-button {
  padding: var(--spacing-3) var(--spacing-6);
  background-color: var(--color-white);
  color: var(--color-black);
  font-size: var(--font-size-sm);
  font-weight: 600;
  border: var(--border-width-thin) solid var(--color-gray-200);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  cursor: pointer;
}

.difficulty-button:hover {
  border-color: var(--color-black);
}

.difficulty-button--active {
  background-color: var(--color-black);
  color: var(--color-white);
  border-color: var(--color-black);
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

/* 响应式设计 */
@media (max-width: 640px) {
  .international-checkers-view {
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

  .difficulty-buttons {
    flex-direction: column;
  }

  .start-game-button {
    padding: var(--spacing-3) var(--spacing-8);
    font-size: var(--font-size-base);
  }
}
</style>