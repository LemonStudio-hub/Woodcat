/**
 * 光球游戏常量和类型定义
 */

/**
 * 球配置
 */
export const BALL_CONFIG = {
  RADIUS: 30,
  SPEED: 8,
  COLOR: '#ffffff',
  GLOW_COLOR: 'rgba(255, 255, 255, 0.6)',
  GLOW_SIZE: 50,
} as const;

/**
 * 游戏配置
 */
export const GAME_CONFIG = {
  SCREEN_WIDTH: 800,
  SCREEN_HEIGHT: 600,
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
 * 虚拟摇杆配置
 */
export const JOYSTICK_CONFIG = {
  RADIUS: 50,
  HANDLE_RADIUS: 25,
  MAX_DISTANCE: 40,
  DEAD_ZONE: 5,
} as const;