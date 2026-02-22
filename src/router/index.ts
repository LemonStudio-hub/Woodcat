/**
 * 路由配置
 * 定义应用的路由结构
 */

import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

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
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: {
      title: '设置 - 木头猫',
    },
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
 * 设置页面标题
 */
router.beforeEach((to, _from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title as string;
  }
  next();
});

export default router;