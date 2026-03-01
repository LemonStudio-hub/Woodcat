/**
 * 光之子游戏常量和类型定义
 */

/**
 * 游戏状态
 */
export enum GameState {
  READY = 'ready',
  PLAYING = 'playing',
  GAME_OVER = 'game_over',
}

/**
 * 玩家配置
 */
export const PLAYER_CONFIG = {
  RADIUS: 20,
  SPEED: 5,
  COLOR: '#00ffff',
  GLOW_COLOR: 'rgba(0, 255, 255, 0.5)',
  GLOW_SIZE: 40,
} as const;

/**
 * 敌人配置
 */
export const ENEMY_CONFIG = {
  MIN_RADIUS: 10,
  MAX_RADIUS: 25,
  MIN_SPEED: 2,
  MAX_SPEED: 5,
  COLORS: [
    '#ff4444', // 红
    '#ff8844', // 橙
    '#ffcc44', // 黄
    '#44ff44', // 绿
    '#ff44ff', // 紫
    '#4444ff', // 蓝
  ],
  EXPLOSION_RADIUS: 50,
  EXPLOSION_DURATION: 500, // 毫秒
} as const;

/**
 * 游戏配置
 */
export const GAME_CONFIG = {
  SCREEN_WIDTH: 800,
  SCREEN_HEIGHT: 600,
  INITIAL_SPAWN_RATE: 2000, // 毫秒
  MIN_SPAWN_RATE: 500, // 毫秒
  DIFFICULTY_INCREASE_INTERVAL: 10000, // 每10秒增加难度
  SPAWN_RATE_DECREASE: 100, // 每次减少100ms
} as const;

/**
 * 位置接口
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * 速度接口
 */
export interface Velocity {
  vx: number;
  vy: number;
}

/**
 * 敌人接口
 */
export interface Enemy {
  id: number;
  position: Position;
  velocity: Velocity;
  radius: number;
  color: string;
  isExploding: boolean;
  explosionStartTime: number;
}

/**
 * 玩家接口
 */
export interface Player {
  position: Position;
  radius: number;
  isMovingUp: boolean;
  isMovingDown: boolean;
  isMovingLeft: boolean;
  isMovingRight: boolean;
}

/**
 * 游戏统计接口
 */
export interface GameStats {
  survivalTime: number; // 存活时间（毫秒）
  enemiesDodged: number; // 躲避的敌人数量
  enemiesExploded: number; // 爆炸的敌人数量
}

/**
 * 输入键位映射
 */
export const KEY_BINDINGS = {
  UP: ['ArrowUp', 'KeyW'],
  DOWN: ['ArrowDown', 'KeyS'],
  LEFT: ['ArrowLeft', 'KeyA'],
  RIGHT: ['ArrowRight', 'KeyD'],
} as const;