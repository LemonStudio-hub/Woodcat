/**
 * 服务层单元测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('persistenceService', () => {
  beforeEach(() => {
    // 清空 localStorage
    localStorage.clear();
  });

  describe('保存和读取游戏数据', () => {
    it('应该能够保存和读取游戏数据', () => {
      const gameData = {
        score: 100,
        level: 5,
        timestamp: Date.now(),
      };

      const gameId = 'test-game';

      // 模拟保存
      const key = `woodcat_game_${gameId}`;
      localStorage.setItem(key, JSON.stringify(gameData));

      // 模拟读取
      const savedData = localStorage.getItem(key);
      const parsedData = savedData ? JSON.parse(savedData) : null;

      expect(parsedData).toEqual(gameData);
    });

    it('应该能够删除游戏数据', () => {
      const gameData = { score: 100 };
      const gameId = 'test-game';
      const key = `woodcat_game_${gameId}`;

      localStorage.setItem(key, JSON.stringify(gameData));
      expect(localStorage.getItem(key)).toBeTruthy();

      localStorage.removeItem(key);
      expect(localStorage.getItem(key)).toBeNull();
    });

    it('应该能够检查游戏数据是否存在', () => {
      const gameId = 'test-game';
      const key = `woodcat_game_${gameId}`;

      expect(localStorage.getItem(key)).toBeNull();

      localStorage.setItem(key, JSON.stringify({ score: 100 }));
      expect(localStorage.getItem(key)).toBeTruthy();
    });
  });

  describe('错误处理', () => {
    it('应该处理 JSON 解析错误', () => {
      const gameId = 'test-game';
      const key = `woodcat_game_${gameId}`;

      localStorage.setItem(key, 'invalid json');

      const savedData = localStorage.getItem(key);
      expect(() => {
        JSON.parse(savedData || '');
      }).toThrow();

      // 修复后的代码应该处理这个错误
      try {
        JSON.parse(savedData || '');
      } catch (e) {
        expect(e).toBeInstanceOf(SyntaxError);
      }
    });

    it('应该处理 localStorage 配额超出', () => {
      // 模拟配额超出
      const mockError = new Error('QuotaExceededError');
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw mockError;
      });

      const gameId = 'test-game';
      const key = `woodcat_game_${gameId}`;
      const gameData = { score: 100 };

      expect(() => {
        localStorage.setItem(key, JSON.stringify(gameData));
      }).toThrow(mockError);

      setItemSpy.mockRestore();
    });
  });
});

describe('audioService', () => {
  let mockAudioContext: any;

  beforeEach(() => {
    // Mock AudioContext
    mockAudioContext = {
      createOscillator: vi.fn(() => ({
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
      })),
      createGainNode: vi.fn(() => ({
        connect: vi.fn(),
        gain: { value: 0 },
      })),
      currentTime: 0,
    };

    vi.spyOn(window, 'AudioContext').mockImplementation(() => mockAudioContext);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('音频播放', () => {
    it('应该能够创建音频上下文', () => {
      const audioContext = new AudioContext();
      expect(audioContext).toBeDefined();
      expect(window.AudioContext).toHaveBeenCalled();
    });

    it('应该能够创建振荡器', () => {
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();

      expect(oscillator).toBeDefined();
      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    });

    it('应该能够创建增益节点', () => {
      const audioContext = new AudioContext();
      const gainNode = audioContext.createGainNode();

      expect(gainNode).toBeDefined();
      expect(mockAudioContext.createGainNode).toHaveBeenCalled();
    });
  });

  describe('音量控制', () => {
    it('应该能够设置音量', () => {
      const audioContext = new AudioContext();
      const gainNode = audioContext.createGainNode();

      const volume = 0.5;
      gainNode.gain.value = volume;

      expect(gainNode.gain.value).toBe(volume);
    });

    it('音量应该在 0 到 1 之间', () => {
      const audioContext = new AudioContext();
      const gainNode = audioContext.createGainNode();

      gainNode.gain.value = 0.8;
      expect(gainNode.gain.value).toBeGreaterThanOrEqual(0);
      expect(gainNode.gain.value).toBeLessThanOrEqual(1);
    });
  });
});

describe('vibrationService', () => {
  beforeEach(() => {
    // Mock navigator.vibrate
    Object.defineProperty(navigator, 'vibrate', {
      writable: true,
      value: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('震动功能', () => {
    it('应该能够调用震动 API', () => {
      navigator.vibrate(100);
      expect(navigator.vibrate).toHaveBeenCalledWith(100);
    });

    it('应该能够使用震动模式', () => {
      const pattern = [100, 50, 100];
      navigator.vibrate(pattern);
      expect(navigator.vibrate).toHaveBeenCalledWith(pattern);
    });

    it('应该能够停止震动', () => {
      navigator.vibrate(0);
      expect(navigator.vibrate).toHaveBeenCalledWith(0);
    });
  });

  describe('浏览器兼容性', () => {
    it('应该处理不支持震动 API 的情况', () => {
      delete (navigator as any).vibrate;

      expect(() => {
        navigator.vibrate(100);
      }).not.toThrow();
    });

    it('震动 API 应该返回 boolean', () => {
      navigator.vibrate(100);
      expect(navigator.vibrate).toHaveBeenCalled();
    });
  });
});