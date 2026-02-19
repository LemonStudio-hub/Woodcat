/**
 * 贪吃蛇游戏常量定义
 * 定义游戏中使用的常量值
 */

/**
 * 游戏棋盘大小（格数）
 */
export const BOARD_SIZE = 20;

/**
 * 初始蛇长度
 */
export const INITIAL_SNAKE_LENGTH = 3;

/**
 * 游戏速度（毫秒/格）
 */
export const GAME_SPEED = 150;

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
 * 方向键映射
 */
export const DIRECTION_KEY_MAP: Record<string, Direction> = {
  ArrowUp: Direction.UP,
  ArrowDown: Direction.DOWN,
  ArrowLeft: Direction.LEFT,
  ArrowRight: Direction.RIGHT,
  w: Direction.UP,
  s: Direction.DOWN,
  a: Direction.LEFT,
  d: Direction.RIGHT,
  W: Direction.UP,
  S: Direction.DOWN,
  A: Direction.LEFT,
  D: Direction.RIGHT,
};

/**
 * 相反方向映射（用于防止蛇反向移动）
 */
export const OPPOSITE_DIRECTION: Record<Direction, Direction> = {
  [Direction.UP]: Direction.DOWN,
  [Direction.DOWN]: Direction.UP,
  [Direction.LEFT]: Direction.RIGHT,
  [Direction.RIGHT]: Direction.LEFT,
};