/**
 * 游戏常量定义
 * 定义游戏中使用的常量值
 */

import { GameInfo } from '@/types/game';

/**
 * 游戏列表
 */
export const GAME_LIST: GameInfo[] = [
  {
    id: 'rock-paper-scissors',
    name: '石头剪刀布',
    description: '经典的三人对战游戏',
    route: '/game/rock-paper-scissors',
  },
  {
    id: '2048',
    name: '2048',
    description: '滑动合并数字方块',
    route: '/game/2048',
  },
  {
    id: 'snake',
    name: '贪吃蛇',
    description: '经典贪吃蛇游戏',
    route: '/game/snake',
  },
  {
    id: 'gomoku',
    name: '五子棋',
    description: '经典黑白棋对战',
    route: '/game/gomoku',
  },
];

/**
 * 石头剪刀布选项映射
 */
export const RPS_CHOICE_MAP = {
  rock: { label: '石头', emoji: '🪨' },
  paper: { label: '布', emoji: '📄' },
  scissors: { label: '剪刀', emoji: '✂️' },
} as const;

/**
 * 游戏结果映射
 */
export const RPS_RESULT_MAP = {
  win: { label: '胜利', emoji: '🎉' },
  lose: { label: '失败', emoji: '😢' },
  draw: { label: '平局', emoji: '🤝' },
} as const;

/**
 * 动画持续时间（毫秒）
 */
export const ANIMATION_DURATION = 500;

/**
 * 最大历史记录数量
 * 用于 AI 学习用户模式
 */
export const MAX_HISTORY_COUNT = 50;