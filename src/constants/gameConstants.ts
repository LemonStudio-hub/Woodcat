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
  {
    id: 'tetris',
    name: '俄罗斯方块',
    description: '经典方块消除游戏',
    route: '/game/tetris',
  },
  {
    id: 'tictactoe',
    name: '井字棋',
    description: '经典三连游戏',
    route: '/game/tictactoe',
  },
  {
    id: 'international-checkers',
    name: '国际跳棋',
    description: '经典8x8跳棋对战',
    route: '/game/international-checkers',
  },
  {
    id: 'chess',
    name: '国际象棋',
    description: '经典国际象棋对战',
    route: '/game/chess',
  },
  {
    id: 'minesweeper',
    name: '扫雷',
    description: '经典扫雷游戏',
    route: '/game/minesweeper',
  },
];

/**
 * 石头剪刀布选项映射
 */
export const RPS_CHOICE_MAP = {
  rock: { label: '石头' },
  paper: { label: '布' },
  scissors: { label: '剪刀' },
} as const;

/**
 * 游戏结果映射
 */
export const RPS_RESULT_MAP = {
  win: { label: '胜利' },
  lose: { label: '失败' },
  draw: { label: '平局' },
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