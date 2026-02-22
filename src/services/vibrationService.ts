/**
 * 震动服务
 * 使用 Vibration API 提供震动反馈
 */

/**
 * 震动类型枚举
 */
export enum VibrationType {
  // 通用震动
  CLICK = 'click',           // 点击
  START = 'start',           // 开始游戏
  WIN = 'win',               // 胜利
  LOSE = 'lose',             // 失败
  DRAW = 'draw',             // 平局
  
  // 2048 震动
  MOVE = 'move',             // 移动
  MERGE = 'merge',           // 合并
  SCORE = 'score',           // 得分
  
  // 贪吃蛇震动
  EAT = 'eat',               // 吃食物
  CRASH = 'crash',           // 碰撞
  
  // 五子棋震动
  PLACE_BLACK = 'place_black', // 下黑子
  PLACE_WHITE = 'place_white', // 下白子
  
  // 井字棋震动
  PLACE_X = 'place_x',       // 下X
  PLACE_O = 'place_o',       // 下O
  
  // 俄罗斯方块震动
  ROTATE = 'rotate',         // 旋转
  DROP = 'drop',             // 下落
  CLEAR = 'clear',           // 消除
  GAME_OVER = 'game_over',   // 游戏结束
}

/**
 * 震动配置接口
 */
interface VibrationConfig {
  pattern: number[];
}

/**
 * 震动映射
 */
const VIBRATION_CONFIGS: Record<VibrationType, VibrationConfig> = {
  // 通用震动
  [VibrationType.CLICK]: {
    pattern: [10],
  },
  [VibrationType.START]: {
    pattern: [50],
  },
  [VibrationType.WIN]: {
    pattern: [100, 50, 100],
  },
  [VibrationType.LOSE]: {
    pattern: [200, 100, 200],
  },
  [VibrationType.DRAW]: {
    pattern: [50, 50, 50],
  },
  
  // 2048 震动
  [VibrationType.MOVE]: {
    pattern: [5],
  },
  [VibrationType.MERGE]: {
    pattern: [20, 10, 20],
  },
  [VibrationType.SCORE]: {
    pattern: [30],
  },
  
  // 贪吃蛇震动
  [VibrationType.EAT]: {
    pattern: [20],
  },
  [VibrationType.CRASH]: {
    pattern: [100, 50, 100],
  },
  
  // 五子棋震动
  [VibrationType.PLACE_BLACK]: {
    pattern: [15],
  },
  [VibrationType.PLACE_WHITE]: {
    pattern: [15],
  },
  
  // 井字棋震动
  [VibrationType.PLACE_X]: {
    pattern: [15],
  },
  [VibrationType.PLACE_O]: {
    pattern: [15],
  },
  
  // 俄罗斯方块震动
  [VibrationType.ROTATE]: {
    pattern: [10],
  },
  [VibrationType.DROP]: {
    pattern: [20],
  },
  [VibrationType.CLEAR]: {
    pattern: [50, 30, 50],
  },
  [VibrationType.GAME_OVER]: {
    pattern: [200, 100, 200],
  },
};

/**
 * 震动服务类
 */
class VibrationService {
  private enabled: boolean = true;

  /**
   * 检查设备是否支持震动
   */
  private isSupported(): boolean {
    return 'vibrate' in navigator;
  }

  /**
   * 触发震动
   */
  vibrate(vibrationType: VibrationType): void {
    if (!this.enabled) return;

    if (!this.isSupported()) return;

    try {
      const config = VIBRATION_CONFIGS[vibrationType];
      if (config) {
        navigator.vibrate(config.pattern);
      }
    } catch (error) {
      console.error('Failed to vibrate:', error);
    }
  }

  /**
   * 触发自定义震动
   */
  vibrateCustom(pattern: number | number[]): void {
    if (!this.enabled) return;

    if (!this.isSupported()) return;

    try {
      navigator.vibrate(pattern);
    } catch (error) {
      console.error('Failed to vibrate:', error);
    }
  }

  /**
   * 停止震动
   */
  stop(): void {
    if (this.isSupported()) {
      navigator.vibrate(0);
    }
  }

  /**
   * 启用震动
   */
  enable(): void {
    this.enabled = true;
  }

  /**
   * 禁用震动
   */
  disable(): void {
    this.enabled = false;
    this.stop();
  }

  /**
   * 切换震动状态
   */
  toggle(): boolean {
    this.enabled = !this.enabled;
    if (!this.enabled) {
      this.stop();
    }
    return this.enabled;
  }

  /**
   * 检查震动是否启用
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}

// 导出单例实例
export const vibrationService = new VibrationService();