/**
 * 音效服务
 * 使用 Web Audio API 提供游戏音效
 */

/**
 * 音效类型枚举
 */
export enum SoundType {
  // 通用音效
  CLICK = 'click',           // 点击
  START = 'start',           // 开始游戏
  WIN = 'win',               // 胜利
  LOSE = 'lose',             // 失败
  DRAW = 'draw',             // 平局
  
  // 2048 音效
  MOVE = 'move',             // 移动
  MERGE = 'merge',           // 合并
  SCORE = 'score',           // 得分
  
  // 贪吃蛇音效
  EAT = 'eat',               // 吃食物
  CRASH = 'crash',           // 碰撞
  
  // 五子棋音效
  PLACE_BLACK = 'place_black', // 下黑子
  PLACE_WHITE = 'place_white', // 下白子
  
  // 井字棋音效
  PLACE_X = 'place_x',       // 下X
  PLACE_O = 'place_o',       // 下O
  
  // 俄罗斯方块音效
  ROTATE = 'rotate',         // 旋转
  DROP = 'drop',             // 下落
  CLEAR = 'clear',           // 消除
  GAME_OVER = 'game_over',   // 游戏结束
  
  // 光之子音效
  EXPLOSION = 'explosion',   // 爆炸
}

/**
 * 音效配置接口
 */
interface SoundConfig {
  frequency: number;
  duration: number;
  type: OscillatorType;
  volume: number;
  attack?: number;
  decay?: number;
  sustain?: number;
  release?: number;
  additionalOscillators?: Array<{
    frequency: number;
    type: OscillatorType;
    volume: number;
    phaseOffset?: number;
  }>;
}

/**
 * 音效映射
 */
const SOUND_CONFIGS: Record<SoundType, SoundConfig> = {
  // 通用音效
  [SoundType.CLICK]: {
    frequency: 800,
    duration: 0.05,
    type: 'sine',
    volume: 0.3,
  },
  [SoundType.START]: {
    frequency: 523.25,
    duration: 0.15,
    type: 'sine',
    volume: 0.4,
    attack: 0.01,
    decay: 0.1,
  },
  [SoundType.WIN]: {
    frequency: 1047,
    duration: 0.5,
    type: 'sine',
    volume: 0.6,
    attack: 0.01,
    decay: 0.15,
    sustain: 0.2,
    release: 0.14,
    additionalOscillators: [
      { frequency: 1319, type: 'triangle', volume: 0.3, phaseOffset: 0 },
      { frequency: 523, type: 'sine', volume: 0.25, phaseOffset: Math.PI / 4 }
    ]
  },
  [SoundType.LOSE]: {
    frequency: 220,
    duration: 0.3,
    type: 'sawtooth',
    volume: 0.4,
    attack: 0.01,
    decay: 0.2,
  },
  [SoundType.DRAW]: {
    frequency: 440,
    duration: 0.2,
    type: 'square',
    volume: 0.3,
  },
  
  // 2048 音效
  [SoundType.MOVE]: {
    frequency: 500,
    duration: 0.12,
    type: 'sine',
    volume: 0.35,
    attack: 0.02,
    decay: 0.05,
    sustain: 0.03,
    release: 0.02,
    additionalOscillators: [
      { frequency: 800, type: 'triangle', volume: 0.2, phaseOffset: 0 },
      { frequency: 250, type: 'sine', volume: 0.15, phaseOffset: Math.PI / 4 }
    ]
  },
  [SoundType.MERGE]: {
    frequency: 750,
    duration: 0.18,
    type: 'sine',
    volume: 0.5,
    attack: 0.02,
    decay: 0.08,
    sustain: 0.05,
    release: 0.03,
    additionalOscillators: [
      { frequency: 1500, type: 'triangle', volume: 0.25, phaseOffset: 0 },
      { frequency: 375, type: 'sine', volume: 0.2, phaseOffset: Math.PI / 3 }
    ]
  },
  [SoundType.SCORE]: {
    frequency: 700,
    duration: 0.1,
    type: 'sine',
    volume: 0.5,
    attack: 0.01,
    decay: 0.08,
  },
  
  // 贪吃蛇音效
  [SoundType.EAT]: {
    frequency: 880,
    duration: 0.05,
    type: 'sine',
    volume: 0.4,
  },
  [SoundType.CRASH]: {
    frequency: 150,
    duration: 0.2,
    type: 'sawtooth',
    volume: 0.5,
    attack: 0.01,
    decay: 0.15,
  },
  
  // 五子棋音效
  [SoundType.PLACE_BLACK]: {
    frequency: 440,
    duration: 0.08,
    type: 'sine',
    volume: 0.4,
    attack: 0.01,
    decay: 0.05,
  },
  [SoundType.PLACE_WHITE]: {
    frequency: 554.37,
    duration: 0.08,
    type: 'sine',
    volume: 0.4,
    attack: 0.01,
    decay: 0.05,
  },
  
  // 井字棋音效
  [SoundType.PLACE_X]: {
    frequency: 523.25,
    duration: 0.08,
    type: 'sine',
    volume: 0.4,
    attack: 0.01,
    decay: 0.05,
  },
  [SoundType.PLACE_O]: {
    frequency: 659.25,
    duration: 0.08,
    type: 'sine',
    volume: 0.4,
    attack: 0.01,
    decay: 0.05,
  },
  
  // 俄罗斯方块音效
  [SoundType.ROTATE]: {
    frequency: 350,
    duration: 0.05,
    type: 'sine',
    volume: 0.3,
  },
  [SoundType.DROP]: {
    frequency: 250,
    duration: 0.08,
    type: 'sine',
    volume: 0.4,
    attack: 0.01,
    decay: 0.05,
  },
  [SoundType.CLEAR]: {
    frequency: 1000,
    duration: 0.15,
    type: 'sine',
    volume: 0.5,
    attack: 0.01,
    decay: 0.1,
  },
  [SoundType.GAME_OVER]: {
    frequency: 200,
    duration: 0.4,
    type: 'sawtooth',
    volume: 0.5,
    attack: 0.01,
    decay: 0.3,
  },
  [SoundType.EXPLOSION]: {
    frequency: 150,
    duration: 0.3,
    type: 'sawtooth',
    volume: 0.6,
    attack: 0.01,
    decay: 0.2,
  },
};

/**
 * 音效服务类
 */
class AudioService {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private enabled: boolean = true;
  private errorCount: number = 0;
  private maxErrors: number = 3;
  private cleanupTimer: number | null = null;

  /**
   * 初始化音频上下文
   */
  private initContext(): void {
    if (!this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.masterGain = this.audioContext.createGain();
        this.masterGain.connect(this.audioContext.destination);
        this.masterGain.gain.value = 0.5; // 主音量
        this.errorCount = 0; // 重置错误计数
      } catch (error) {
        console.error('Failed to initialize AudioContext:', error);
        this.enabled = false;
        throw error;
      }
    }
  }

  /**
   * 清理音频上下文
   */
  private cleanupContext(): void {
    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch (error) {
        console.error('Failed to close AudioContext:', error);
      }
      this.audioContext = null;
      this.masterGain = null;
    }
  }

  /**
   * 播放音效
   */
  play(soundType: SoundType): void {
    if (!this.enabled) return;

    try {
      this.initContext();

      if (!this.audioContext || !this.masterGain) return;

      const config = SOUND_CONFIGS[soundType];
      if (!config) {
        console.warn(`Unknown sound type: ${soundType}`);
        return;
      }

      // 恢复音频上下文（如果被挂起）
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      // 创建振荡器
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      // 配置振荡器
      oscillator.type = config.type;
      oscillator.frequency.setValueAtTime(config.frequency, this.audioContext.currentTime);

      // 配置音量包络
      const now = this.audioContext.currentTime;
      const attack = config.attack || 0.01;
      const decay = config.decay || config.duration - 0.01;

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(config.volume, now + attack);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + attack + decay);

      // 连接节点
      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain);

      // 播放
      oscillator.start(now);
      oscillator.stop(now + config.duration);

      // 重置错误计数
      this.errorCount = 0;
    } catch (error) {
      console.error('Failed to play sound:', error);
      this.errorCount++;

      // 如果错误次数超过阈值，禁用音效
      if (this.errorCount >= this.maxErrors) {
        this.enabled = false;
        console.warn('音效播放失败次数过多，已自动关闭音效。请刷新页面重试。');
      }
    }
  }

  /**
   * 重试启用音效
   */
  retryEnable(): void {
    this.errorCount = 0;
    this.enabled = true;
    try {
      this.cleanupContext();
      this.initContext();
      console.log('音效服务已重置');
    } catch (error) {
      console.error('重试启用音效失败:', error);
    }
  }

  /**
   * 清理资源
   */
  dispose(): void {
    if (this.cleanupTimer) {
      clearTimeout(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.cleanupContext();
    this.enabled = false;
  }

  /**
   * 播放序列音效（如胜利时的旋律）
   */
  playSequence(soundTypes: SoundType[], interval: number = 100): void {
    if (!this.enabled) return;

    soundTypes.forEach((soundType, index) => {
      setTimeout(() => {
        this.play(soundType);
      }, index * interval);
    });
  }

  /**
   * 启用音效
   */
  enable(): void {
    this.enabled = true;
  }

  /**
   * 禁用音效
   */
  disable(): void {
    this.enabled = false;
  }

  /**
   * 切换音效状态
   */
  toggle(): boolean {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  /**
   * 检查音效是否启用
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * 设置主音量
   */
  setVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  /**
   * 获取当前音量
   */
  getVolume(): number {
    return this.masterGain?.gain.value || 0.5;
  }
}

// 导出单例实例
export const audioService = new AudioService();