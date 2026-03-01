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