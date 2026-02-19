<template>
  <div class="home-view">
    <div class="hero-section">
      <div class="container">
        <div class="hero-content">
          <div class="hero-icon">🐱</div>
          <h1 class="hero-title">木头猫</h1>
          <p class="hero-subtitle">极简黑白风格小游戏合集</p>
          <button @click="openGame()" class="hero-button">
            开始游戏
          </button>
        </div>
      </div>
    </div>

    <section class="games-section">
      <div class="container">
        <h2 class="section-title">游戏列表</h2>
        <div class="games-grid">
          <div
            v-for="game in games"
            :key="game.id"
            class="game-card"
            @click="openGame(game.route)"
          >
            <div class="game-card-content">
              <h3 class="game-card-title">{{ game.name }}</h3>
              <p class="game-card-description">{{ game.description }}</p>
              <span class="game-card-link">
                进入游戏 →
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
/**
 * 首页视图组件
 * 展示游戏列表和介绍
 */

import { ref } from 'vue';
import type { GameInfo } from '@/types/game';
import { GAME_LIST } from '@/constants/gameConstants';

/**
 * 游戏列表
 */
const games = ref<GameInfo[]>(GAME_LIST);

/**
 * 随机选择一个游戏
 */
function getRandomGameRoute(): string {
  const gameList = GAME_LIST;
  const randomIndex = Math.floor(Math.random() * gameList.length);
  return gameList[randomIndex].route;
}

/**
 * 打开随机游戏（在新标签页）
 */
function openGame(route?: string): void {
  // 如果没有指定路由，随机选择一个
  const gameRoute = route || getRandomGameRoute();
  
  // 使用 BroadcastChannel 通知其他游戏标签页关闭
  const channel = new BroadcastChannel('woodcat-games');
  
  // 发送关闭消息
  channel.postMessage({
    type: 'close-game',
    gameRoute: gameRoute,
  });
  
  // 关闭通道
  channel.close();
  
  // 在新标签页打开游戏
  const gameWindow = window.open(gameRoute, '_blank');
  
  // 如果打开失败（被浏览器阻止），使用当前窗口跳转
  if (!gameWindow) {
    window.location.href = gameRoute;
  }
}
</script>

<style scoped>
/**
 * 首页视图样式
 */

.home-view {
  min-height: calc(100vh - 8rem);
}

/* 英雄区域 */
.hero-section {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-16) 0;
  background-color: var(--color-gray-100);
}

.hero-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-6);
  text-align: center;
}

.hero-icon {
  font-size: 6rem;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.hero-title {
  font-size: var(--font-size-4xl);
  font-weight: 800;
  color: var(--color-black);
  letter-spacing: 0.1em;
}

.hero-subtitle {
  font-size: var(--font-size-lg);
  color: var(--color-gray-600);
  max-width: 500px;
}

.hero-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-4) var(--spacing-8);
  background-color: var(--color-black);
  color: var(--color-white);
  font-size: var(--font-size-base);
  font-weight: 600;
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
  box-shadow: var(--shadow-md);
  border: none;
  cursor: pointer;
}

.hero-button:hover {
  background-color: var(--color-gray-800);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.hero-button:active {
  transform: translateY(0);
}

/* 游戏列表区域 */
.games-section {
  padding: var(--spacing-16) 0;
}

.section-title {
  font-size: var(--font-size-3xl);
  font-weight: 800;
  color: var(--color-black);
  text-align: center;
  margin-bottom: var(--spacing-10);
}

.games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-6);
  max-width: 900px;
  margin: 0 auto;
}

.game-card {
  background-color: var(--color-white);
  border: var(--border-width-medium) solid var(--color-gray-200);
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);
  overflow: hidden;
  cursor: pointer;
}

.game-card:hover {
  border-color: var(--color-black);
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.game-card-content {
  padding: var(--spacing-6);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.game-card-title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-black);
}

.game-card-description {
  font-size: var(--font-size-base);
  color: var(--color-gray-600);
  line-height: 1.6;
}

.game-card-link {
  align-self: flex-start;
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-black);
  pointer-events: none;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .hero-section {
    padding: var(--spacing-10) 0;
  }

  .hero-icon {
    font-size: 4rem;
  }

  .hero-title {
    font-size: var(--font-size-2xl);
  }

  .hero-subtitle {
    font-size: var(--font-size-base);
  }

  .hero-button {
    padding: var(--spacing-3) var(--spacing-6);
    font-size: var(--font-size-sm);
  }

  .games-section {
    padding: var(--spacing-10) 0;
  }

  .section-title {
    font-size: var(--font-size-2xl);
    margin-bottom: var(--spacing-6);
  }

  .games-grid {
    grid-template-columns: 1fr;
  }
}
</style>