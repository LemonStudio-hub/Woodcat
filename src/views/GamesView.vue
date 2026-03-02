<template>
  <div class="games-view">
    <div class="games-header">
      <h2 class="games-title">游戏大厅</h2>
      <p class="games-subtitle">选择一个游戏开始游玩</p>
    </div>

    <div class="games-grid">
      <router-link
        v-for="game in games"
        :key="game.id"
        :to="game.path"
        class="game-card"
      >
        <div class="game-icon">{{ game.icon }}</div>
        <div class="game-info">
          <h3 class="game-name">{{ game.name }}</h3>
          <p class="game-description">{{ game.description }}</p>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 游戏大厅视图组件
 */

interface Game {
  id: string;
  name: string;
  description: string;
  icon: string;
  path: string;
}

const games: Game[] = [
  {
    id: 'rock-paper-scissors',
    name: '石头剪刀布',
    description: '经典的猜拳游戏',
    icon: '👊',
    path: '/game/rock-paper-scissors',
  },
  {
    id: '2048',
    name: '2048',
    description: '合并数字，挑战2048',
    icon: '🔢',
    path: '/game/2048',
  },
  {
    id: 'snake',
    name: '贪吃蛇',
    description: '控制蛇吃食物成长',
    icon: '🐍',
    path: '/game/snake',
  },
  {
    id: 'gomoku',
    name: '五子棋',
    description: '黑白棋子，五子连珠',
    icon: '⚫',
    path: '/game/gomoku',
  },
  {
    id: 'tetris',
    name: '俄罗斯方块',
    description: '经典方块消除游戏',
    icon: '🧱',
    path: '/game/tetris',
  },
  {
    id: 'tictactoe',
    name: '井字棋',
    description: '三子连珠，谁先连成',
    icon: '❌',
    path: '/game/tictactoe',
  },
  {
    id: 'international-checkers',
    name: '国际跳棋',
    description: '策略对战棋类游戏',
    icon: '♟️',
    path: '/game/international-checkers',
  },
  {
    id: 'chess',
    name: '国际象棋',
    description: '经典的策略棋类游戏',
    icon: '♔',
    path: '/game/chess',
  },
  {
    id: 'minesweeper',
    name: '扫雷',
    description: '找出所有地雷',
    icon: '💣',
    path: '/game/minesweeper',
  },
  {
    id: 'go',
    name: '围棋',
    description: '东方智慧，黑白博弈',
    icon: '⚪',
    path: '/game/go',
  },
  {
    id: 'light-ball',
    name: '光球',
    description: '敏捷反应挑战',
    icon: '🔴',
    path: '/game/light-ball',
  },
];
</script>

<style scoped>
/**
 * 游戏大厅视图样式
 */

.games-view {
  background-color: var(--color-white);
  border: var(--border-width-thin) solid var(--color-gray-200);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.games-header {
  padding: var(--spacing-6);
  border-bottom: var(--border-width-thin) solid var(--color-gray-200);
}

.games-title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-black);
  margin: 0 0 var(--spacing-2) 0;
}

.games-subtitle {
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
  margin: 0;
}

.games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-4);
  padding: var(--spacing-6);
}

.game-card {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  padding: var(--spacing-4);
  background-color: var(--color-gray-50);
  border: var(--border-width-thin) solid var(--color-gray-200);
  border-radius: var(--radius-lg);
  text-decoration: none;
  transition: all var(--transition-fast);
}

.game-card:hover {
  background-color: var(--color-gray-100);
  border-color: var(--color-gray-300);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.game-icon {
  font-size: 3rem;
  text-align: center;
}

.game-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.game-name {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-black);
  margin: 0;
  text-align: center;
}

.game-description {
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
  margin: 0;
  text-align: center;
  line-height: 1.4;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .games-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: var(--spacing-3);
    padding: var(--spacing-4);
  }

  .game-card {
    padding: var(--spacing-3);
  }

  .game-icon {
    font-size: 2.5rem;
  }

  .game-name {
    font-size: var(--font-size-sm);
  }

  .game-description {
    font-size: var(--font-size-xs);
  }
}
</style>