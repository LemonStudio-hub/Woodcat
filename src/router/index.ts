/**
 * 路由配置
 * 定义应用的路由结构
 */

import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useUserStore } from '@/stores/userStore';

/**
 * 路由配置
 */
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue'),
    meta: {
      title: '首页 - 木头猫',
    },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: {
      title: '登录 - 木头猫',
    },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/RegisterView.vue'),
    meta: {
      title: '注册 - 木头猫',
    },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: {
      title: '个人资料 - 木头猫',
      requiresAuth: true,
    },
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: {
      title: '设置 - 木头猫',
    },
  },
  {
    path: '/community',
    name: 'Community',
    component: () => import('@/views/CommunityView.vue'),
    meta: {
      title: '社区 - 木头猫',
    },
    children: [
      {
        path: 'notifications',
        name: 'Notifications',
        component: () => import('@/views/NotificationsView.vue'),
        meta: {
          title: '通知中心 - 木头猫',
        },
      },
    ],
  },
  {
    path: '/game/rock-paper-scissors',
    name: 'RockPaperScissors',
    component: () => import('@/views/GameView.vue'),
    meta: {
      title: '石头剪刀布 - 木头猫',
    },
  },
  {
    path: '/game/2048',
    name: 'Game2048',
    component: () => import('@/views/Game2048View.vue'),
    meta: {
      title: '2048 - 木头猫',
    },
  },
  {
    path: '/game/snake',
    name: 'Snake',
    component: () => import('@/views/SnakeView.vue'),
    meta: {
      title: '贪吃蛇 - 木头猫',
    },
  },
  {
    path: '/game/gomoku',
    name: 'Gomoku',
    component: () => import('@/views/GomokuView.vue'),
    meta: {
      title: '五子棋 - 木头猫',
    },
  },
  {
    path: '/game/tetris',
    name: 'Tetris',
    component: () => import('@/views/TetrisView.vue'),
    meta: {
      title: '俄罗斯方块 - 木头猫',
    },
  },
  {
    path: '/game/tictactoe',
    name: 'TicTacToe',
    component: () => import('@/views/TicTacToeView.vue'),
    meta: {
      title: '井字棋 - 木头猫',
    },
  },
  {
    path: '/game/international-checkers',
    name: 'InternationalCheckers',
    component: () => import('@/views/InternationalCheckersView.vue'),
    meta: {
      title: '国际跳棋 - 木头猫',
    },
  },
  {
    path: '/game/chess',
    name: 'Chess',
    component: () => import('@/views/ChessView.vue'),
    meta: {
      title: '国际象棋 - 木头猫',
    },
  },
  {
    path: '/game/minesweeper',
    name: 'Minesweeper',
    component: () => import('@/views/MinesweeperView.vue'),
    meta: {
      title: '扫雷 - 木头猫',
    },
  },
  {
    path: '/game/go',
    name: 'Go',
    component: () => import('@/views/GoView.vue'),
    meta: {
      title: '围棋 - 木头猫',
    },
  },
  {
    path: '/game/light-ball',
    name: 'LightBall',
    component: () => import('@/views/LightBallView.vue'),
    meta: {
      title: '光球 - 木头猫',
    },
  },
];

/**
 * 创建路由实例
 */
const router = createRouter({
  history: createWebHistory(),
  routes,
});

/**
 * 路由前置守卫
 * 设置页面标题并检查认证
 */
router.beforeEach(async (to, _from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title as string;
  }

  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    const userStore = useUserStore();
    await userStore.verifyToken();
    
    if (!userStore.user) {
      next('/login');
      return;
    }
  }

  // 如果已登录，访问登录/注册页面时重定向到首页
  if ((to.path === '/login' || to.path === '/register')) {
    const userStore = useUserStore();
    if (userStore.user) {
      next('/');
      return;
    }
  }

  next();
});

export default router;