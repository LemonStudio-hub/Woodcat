/**
 * 2048 游戏常量定义
 */

/**
 * 游戏方向
 */
export enum Direction {
  UP = 'up',
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right',
}

/**
 * 棋盘大小
 */
export const BOARD_SIZE = 4;

/**
 * 初始方块数量
 */
export const INITIAL_TILES = 2;

/**
 * 方块颜色映射（黑白主题）
 */
export const TILE_COLORS: Record<number, { bg: string; text: string }> = {
  2: { bg: '#f5f5f5', text: '#000' },
  4: { bg: '#e5e5e5', text: '#000' },
  8: { bg: '#d4d4d4', text: '#000' },
  16: { bg: '#a3a3a3', text: '#fff' },
  32: { bg: '#737373', text: '#fff' },
  64: { bg: '#525252', text: '#fff' },
  128: { bg: '#404040', text: '#fff' },
  256: { bg: '#262626', text: '#fff' },
  512: { bg: '#171717', text: '#fff' },
  1024: { bg: '#000', text: '#fff' },
  2048: { bg: '#000', text: '#fff' },
  4096: { bg: '#000', text: '#fff' },
  8192: { bg: '#000', text: '#fff' },
};

/**
 * 动画持续时间（毫秒）
 */
export const ANIMATION_DURATION = 150;

/**
 * 最小滑动距离（像素）
 */
export const MIN_SWIPE_DISTANCE = 30;

/**
 * 新方块生成概率（4 的概率）
 */
export const NEW_TILE_4_PROBABILITY = 0.1;