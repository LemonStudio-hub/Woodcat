<template>
  <header class="header">
    <div class="container">
      <div class="header-content">
        <router-link to="/" class="logo">
          <span class="logo-icon">🐱</span>
          <span class="logo-text">木头猫</span>
        </router-link>
        <nav class="nav">
          <router-link to="/" class="nav-link">首页</router-link>
          <a href="/game/random" class="nav-link" @click.prevent="openRandomGame()">游戏</a>
          <router-link to="/settings" class="nav-link">设置</router-link>
          <div class="user-section">
            <template v-if="user">
              <div class="user-info" @click="toggleUserMenu">
                <span class="user-avatar">{{ user.username.charAt(0).toUpperCase() }}</span>
                <span class="user-name">{{ user.username }}</span>
              </div>
              <div v-if="showUserMenu" class="user-menu">
                <router-link to="/profile" class="user-menu-item">个人资料</router-link>
                <button class="user-menu-item user-menu-item--danger" @click="handleLogout">退出登录</button>
              </div>
            </template>
            <template v-else>
              <router-link to="/login" class="nav-link nav-link--auth nav-link--primary">个人</router-link>
            </template>
          </div>
        </nav>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
/**
 * 头部组件
 * 显示网站 Logo 和导航菜单
 */

import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { GAME_LIST } from '@/constants/gameConstants';

const router = useRouter();
const userStore = useUserStore();

const user = ref(userStore.user);
const showUserMenu = ref(false);

onMounted(() => {
  user.value = userStore.user;
});

onUnmounted(() => {
  // 清理监听器
});

/**
 * 随机选择一个游戏
 */
function getRandomGameRoute(): string {
  const games = GAME_LIST;
  const randomIndex = Math.floor(Math.random() * games.length);
  return games[randomIndex].route;
}

/**
 * 打开随机游戏（在新标签页）
 */
function openRandomGame(): void {
  const route = getRandomGameRoute();
  
  // 使用 BroadcastChannel 通知其他游戏标签页关闭
  const channel = new BroadcastChannel('woodcat-games');
  
  // 发送关闭消息
  channel.postMessage({
    type: 'close-game',
    gameRoute: route,
  });
  
  // 关闭通道
  channel.close();
  
  // 在新标签页打开游戏
  const gameWindow = window.open(route, '_blank');
  
  // 如果打开失败（被浏览器阻止），使用当前窗口跳转
  if (!gameWindow) {
    window.location.href = route;
  }
}

/**
 * 切换用户菜单
 */
function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value;
}

/**
 * 退出登录
 */
async function handleLogout() {
  await userStore.logout();
  showUserMenu.value = false;
  router.push('/');
}

// 点击外部关闭用户菜单
document.addEventListener('click', (e) => {
  if (showUserMenu.value && !(e.target as HTMLElement).closest('.user-section')) {
    showUserMenu.value = false;
  }
});
</script>

<style scoped>
/**
 * 头部组件样式
 */

.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: var(--color-white);
  border-bottom: var(--border-width-thin) solid var(--color-gray-200);
  box-shadow: var(--shadow-sm);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 4rem;
}

/* Logo 样式 */
.logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-black);
  transition: opacity var(--transition-fast);
}

.logo:hover {
  opacity: 0.7;
}

.logo-icon {
  font-size: var(--font-size-2xl);
}

.logo-text {
  letter-spacing: 0.05em;
}

/* 导航样式 */
.nav {
  display: flex;
  gap: var(--spacing-4);
  align-items: center;
}

.nav-link {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-gray-600);
  transition: all var(--transition-fast);
  position: relative;
  padding: var(--spacing-2) var(--spacing-3);
  border-radius: var(--radius-md);
  cursor: pointer;
  text-decoration: none;
}

.nav-link:hover {
  color: var(--color-black);
  background-color: var(--color-gray-100);
}

.nav-link.router-link-active {
  color: var(--color-white);
  background-color: var(--color-black);
  font-weight: 600;
}

.nav-link--auth {
  padding: var(--spacing-2) var(--spacing-4);
}

.nav-link--primary {
  background-color: var(--color-black);
  color: var(--color-white);
}

.nav-link--primary:hover {
  background-color: var(--color-gray-800);
}

.nav-link--primary.router-link-active {
  background-color: var(--color-black);
  color: var(--color-white);
}

.nav-link--primary.router-link-active:hover {
  background-color: var(--color-black);
}

/* 用户区域 */
.user-section {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-3);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.user-info:hover {
  background-color: var(--color-gray-100);
}

.user-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background-color: var(--color-black);
  color: var(--color-white);
  border-radius: 50%;
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.user-name {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-gray-700);
}

/* 用户菜单 */
.user-menu {
  position: absolute;
  top: calc(100% + var(--spacing-2));
  right: 0;
  min-width: 160px;
  background-color: var(--color-white);
  border: var(--border-width-thin) solid var(--color-gray-200);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  padding: var(--spacing-2);
  z-index: 10;
}

.user-menu-item {
  display: block;
  width: 100%;
  padding: var(--spacing-2) var(--spacing-3);
  text-align: left;
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-gray-700);
  background: none;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background-color var(--transition-fast);
  text-decoration: none;
}

.user-menu-item:hover {
  background-color: var(--color-gray-100);
}

.user-menu-item--danger {
  color: var(--color-red-600);
}

.user-menu-item--danger:hover {
  background-color: var(--color-red-50);
}

/* 响应式设计 */
@media (max-width: 640px) {
  .header-content {
    height: 3.5rem;
  }

  .logo {
    font-size: var(--font-size-lg);
  }

  .logo-icon {
    font-size: var(--font-size-xl);
  }

  .nav {
    gap: var(--spacing-2);
  }

  .nav-link {
    font-size: var(--font-size-xs);
    padding: var(--spacing-1) var(--spacing-2);
  }

  .nav-link--auth {
    padding: var(--spacing-1) var(--spacing-3);
  }

  .user-name {
    display: none;
  }
}
</style>