/**
 * 光球游戏常量和类型定义
 */

/**
 * 球配置
 */
export const BALL_CONFIG = {
  RADIUS: 15,
  SPEED: 8,
  COLOR: '#ffffff',
  GLOW_COLOR: 'rgba(255, 255, 255, 0.6)',
  GLOW_SIZE: 30,
} as const;

/**
 * 游戏配置
 */
export const GAME_CONFIG = {
  SCREEN_WIDTH: 800,
  SCREEN_HEIGHT: 600,
} as const;

/**
 * 粒子配置
 */
export const PARTICLE_CONFIG = {
  COUNT: 15,           // 碰撞粒子数量
  TRAIL_COUNT: 2,      // 尾迹粒子数量
  LIFETIME: 1000,      // 粒子存活时间（毫秒）
  TRAIL_LIFETIME: 500, // 尾迹粒子存活时间（毫秒）
  MIN_SIZE: 2,         // 最小粒子大小
  MAX_SIZE: 6,         // 最大粒子大小
  MIN_SPEED: 2,        // 最小速度
  MAX_SPEED: 6,        // 最大速度
  FRICTION: 0.97,      // 摩擦力
} as const;

/**
 * 彩色小球配置
 */
export const ENEMY_BALL_CONFIG = {
  RADIUS: 15,
  SPEED: 4,
  SPAWN_INTERVAL: 3000, // 生成间隔（毫秒）
  MIN_SPAWN_INTERVAL: 1000, // 最小生成间隔
  SPAWN_RATE_DECREASE: 100, // 每次减少的间隔
  DIFFICULTY_INCREASE_INTERVAL: 10000, // 难度增加间隔（毫秒）
  COLORS: [
    '#FF6B6B', // 红色
    '#4ECDC4', // 青色
    '#FFE66D', // 黄色
    '#95E1D3', // 浅绿
    '#F38181', // 浅红
    '#AA96DA', // 紫色
    '#FCBAD3', // 粉色
    '#A8D8EA', // 浅蓝
  ],
} as const;

/**
 * 游戏状态
 */
export enum GameState {
  PLAYING = 'playing',
  GAME_OVER = 'game_over',
}

/**
 * 方向枚举
 */
export enum Direction {
  UP = 'up',
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right',
}

/**
 * 位置接口
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * 球接口
 */
export interface Ball {
  position: Position;
  radius: number;
}

/**
 * 彩色小球接口
 */
export interface EnemyBall {
  id: number;
  position: Position;
  velocity: Position;
  radius: number;
  color: string;
  direction: Direction;
  isExploding: boolean;
  explosionStartTime?: number;
}

/**
 * 粒子接口
 */
export interface Particle {
  id: number;
  position: Position;
  velocity: Position;
  size: number;
  color: string;
  birthTime: number;
  lifetime: number;
}

/**
 * 虚拟摇杆配置
 */
export const JOYSTICK_CONFIG = {
  RADIUS: 50,
  HANDLE_RADIUS: 25,
  MAX_DISTANCE: 40,
  DEAD_ZONE: 5,
} as const;