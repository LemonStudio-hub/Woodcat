/**
 * 游戏常量单元测试
 */

import { describe, it, expect } from 'vitest';
import { GAME_LIST, RPS_CHOICE_MAP, RPS_RESULT_MAP, ANIMATION_DURATION, MAX_HISTORY_COUNT } from '@/constants/gameConstants';

describe('gameConstants', () => {
  describe('GAME_LIST', () => {
    it('应该包含所有游戏', () => {
      expect(GAME_LIST).toBeDefined();
      expect(GAME_LIST.length).toBeGreaterThan(0);
    });

    it('每个游戏应该有必需的字段', () => {
      GAME_LIST.forEach((game) => {
        expect(game).toHaveProperty('id');
        expect(game).toHaveProperty('name');
        expect(game).toHaveProperty('description');
        expect(game).toHaveProperty('route');

        expect(typeof game.id).toBe('string');
        expect(typeof game.name).toBe('string');
        expect(typeof game.description).toBe('string');
        expect(typeof game.route).toBe('string');

        expect(game.id.length).toBeGreaterThan(0);
        expect(game.name.length).toBeGreaterThan(0);
        expect(game.description.length).toBeGreaterThan(0);
        expect(game.route.length).toBeGreaterThan(0);
      });
    });

    it('游戏路由应该以 /game/ 开头', () => {
      GAME_LIST.forEach((game) => {
        expect(game.route).toMatch(/^\/game\//);
      });
    });

    it('游戏 ID 应该是唯一的', () => {
      const ids = GAME_LIST.map((game) => game.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('应该包含石头剪刀布游戏', () => {
      const rpsGame = GAME_LIST.find((game) => game.id === 'rock-paper-scissors');
      expect(rpsGame).toBeDefined();
      expect(rpsGame?.name).toBe('石头剪刀布');
      expect(rpsGame?.route).toBe('/game/rock-paper-scissors');
    });

    it('应该包含 2048 游戏', () => {
      const game2048 = GAME_LIST.find((game) => game.id === '2048');
      expect(game2048).toBeDefined();
      expect(game2048?.name).toBe('2048');
      expect(game2048?.route).toBe('/game/2048');
    });

    it('应该包含 A Dark Room 游戏', () => {
      const adarkroom = GAME_LIST.find((game) => game.id === 'adarkroom');
      expect(adarkroom).toBeDefined();
      expect(adarkroom?.name).toBe('A Dark Room');
      expect(adarkroom?.route).toBe('/game/adarkroom');
    });

    it('应该包含所有预期游戏', () => {
      const expectedGames = [
        'rock-paper-scissors',
        '2048',
        'snake',
        'gomoku',
        'tetris',
        'tictactoe',
        'international-checkers',
        'chess',
        'minesweeper',
        'go',
        'light-ball',
        'adarkroom',
      ];

      const gameIds = GAME_LIST.map((game) => game.id);
      expectedGames.forEach((id) => {
        expect(gameIds).toContain(id);
      });
    });

    it('游戏数量应该是 12 个', () => {
      expect(GAME_LIST.length).toBe(12);
    });
  });

  describe('RPS_CHOICE_MAP', () => {
    it('应该定义所有石头剪刀布选项', () => {
      expect(RPS_CHOICE_MAP).toBeDefined();
      expect(RPS_CHOICE_MAP).toHaveProperty('rock');
      expect(RPS_CHOICE_MAP).toHaveProperty('paper');
      expect(RPS_CHOICE_MAP).toHaveProperty('scissors');
    });

    it('每个选项应该有 label 属性', () => {
      Object.values(RPS_CHOICE_MAP).forEach((choice) => {
        expect(choice).toHaveProperty('label');
        expect(typeof choice.label).toBe('string');
        expect(choice.label.length).toBeGreaterThan(0);
      });
    });

    it('石头应该是"石头"', () => {
      expect(RPS_CHOICE_MAP.rock.label).toBe('石头');
    });

    it('布应该是"布"', () => {
      expect(RPS_CHOICE_MAP.paper.label).toBe('布');
    });

    it('剪刀应该是"剪刀"', () => {
      expect(RPS_CHOICE_MAP.scissors.label).toBe('剪刀');
    });
  });

  describe('RPS_RESULT_MAP', () => {
    it('应该定义所有游戏结果', () => {
      expect(RPS_RESULT_MAP).toBeDefined();
      expect(RPS_RESULT_MAP).toHaveProperty('win');
      expect(RPS_RESULT_MAP).toHaveProperty('lose');
      expect(RPS_RESULT_MAP).toHaveProperty('draw');
    });

    it('每个结果应该有 label 属性', () => {
      Object.values(RPS_RESULT_MAP).forEach((result) => {
        expect(result).toHaveProperty('label');
        expect(typeof result.label).toBe('string');
        expect(result.label.length).toBeGreaterThan(0);
      });
    });

    it('胜利应该是"胜利"', () => {
      expect(RPS_RESULT_MAP.win.label).toBe('胜利');
    });

    it('失败应该是"失败"', () => {
      expect(RPS_RESULT_MAP.lose.label).toBe('失败');
    });

    it('平局应该是"平局"', () => {
      expect(RPS_RESULT_MAP.draw.label).toBe('平局');
    });
  });

  describe('ANIMATION_DURATION', () => {
    it('应该定义动画持续时间', () => {
      expect(ANIMATION_DURATION).toBeDefined();
    });

    it('应该是数字', () => {
      expect(typeof ANIMATION_DURATION).toBe('number');
    });

    it('应该是正数', () => {
      expect(ANIMATION_DURATION).toBeGreaterThan(0);
    });

    it('应该是 500 毫秒', () => {
      expect(ANIMATION_DURATION).toBe(500);
    });
  });

  describe('MAX_HISTORY_COUNT', () => {
    it('应该定义最大历史记录数量', () => {
      expect(MAX_HISTORY_COUNT).toBeDefined();
    });

    it('应该是数字', () => {
      expect(typeof MAX_HISTORY_COUNT).toBe('number');
    });

    it('应该是正数', () => {
      expect(MAX_HISTORY_COUNT).toBeGreaterThan(0);
    });

    it('应该是 50', () => {
      expect(MAX_HISTORY_COUNT).toBe(50);
    });
  });

  describe('常量类型安全', () => {
    it('GAME_LIST 应该是只读的', () => {
      // @ts-expect-error - 测试只读属性
      expect(() => {
        GAME_LIST.push({ id: 'test', name: 'Test', description: 'Test', route: '/test' });
      }).toThrow();
    });

    it('RPS_CHOICE_MAP 应该是只读的', () => {
      // @ts-expect-error - 测试只读属性
      expect(() => {
        RPS_CHOICE_MAP.test = { label: 'Test' };
      }).toThrow();
    });

    it('RPS_RESULT_MAP 应该是只读的', () => {
      // @ts-expect-error - 测试只读属性
      expect(() => {
        RPS_RESULT_MAP.test = { label: 'Test' };
      }).toThrow();
    });
  });
});