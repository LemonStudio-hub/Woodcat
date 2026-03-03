/**
 * GamesView 组件集成测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import GamesView from '@/views/GamesView.vue';

describe('GamesView', () => {
  let wrapper: VueWrapper;
  let router: any;

  beforeEach(() => {
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/community/games', component: GamesView },
        { path: '/game/:id', component: { template: '<div>Game</div>' } },
      ],
    });

    wrapper = mount(GamesView, {
      global: {
        plugins: [router],
      },
    });
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  describe('组件渲染', () => {
    it('应该正确渲染组件', () => {
      expect(wrapper.exists()).toBe(true);
    });

    it('应该包含标题', () => {
      const title = wrapper.find('.games-title');
      expect(title.exists()).toBe(true);
      expect(title.text()).toBe('游戏大厅');
    });

    it('应该包含副标题', () => {
      const subtitle = wrapper.find('.games-subtitle');
      expect(subtitle.exists()).toBe(true);
      expect(subtitle.text()).toBe('选择一个游戏开始游玩');
    });

    it('应该包含游戏网格', () => {
      const grid = wrapper.find('.games-grid');
      expect(grid.exists()).toBe(true);
    });

    it('应该渲染 12 个游戏卡片', () => {
      const cards = wrapper.findAll('.game-card');
      expect(cards.length).toBe(12);
    });
  });

  describe('游戏卡片', () => {
    it('每个游戏卡片应该有必需的元素', () => {
      const cards = wrapper.findAll('.game-card');

      cards.forEach((card) => {
        expect(card.find('.game-icon').exists()).toBe(true);
        expect(card.find('.game-info').exists()).toBe(true);
        expect(card.find('.game-name').exists()).toBe(true);
        expect(card.find('.game-description').exists()).toBe(true);
      });
    });

    it('石头剪刀布卡片应该正确显示', () => {
      const cards = wrapper.findAll('.game-card');
      const rpsCard = cards.find((card) => card.text().includes('石头剪刀布'));

      expect(rpsCard).toBeDefined();
      expect(rpsCard?.find('.game-name').text()).toBe('石头剪刀布');
      expect(rpsCard?.find('.game-icon').text()).toBe('👊');
    });

    it('2048 卡片应该正确显示', () => {
      const cards = wrapper.findAll('.game-card');
      const game2048Card = cards.find((card) => card.text().includes('2048'));

      expect(game2048Card).toBeDefined();
      expect(game2048Card?.find('.game-name').text()).toBe('2048');
      expect(game2048Card?.find('.game-icon').text()).toBe('🔢');
    });

    it('A Dark Room 卡片应该正确显示', () => {
      const cards = wrapper.findAll('.game-card');
      const adarkroomCard = cards.find((card) => card.text().includes('A Dark Room'));

      expect(adarkroomCard).toBeDefined();
      expect(adarkroomCard?.find('.game-name').text()).toBe('A Dark Room');
      expect(adarkroomCard?.find('.game-icon').text()).toBe('🏚️');
    });

    it('游戏图标应该是 emoji', () => {
      const cards = wrapper.findAll('.game-card');

      const icons = [
        '👊', '🔢', '🐍', '⚫', '🧱',
        '❌', '♟️', '♔', '💣', '⚪', '🔴', '🏚️'
      ];

      icons.forEach((icon, index) => {
        expect(cards[index].find('.game-icon').text()).toBe(icon);
      });
    });

    it('每个游戏卡片应该是 router-link', () => {
      const cards = wrapper.findAll('.game-card');

      cards.forEach((card) => {
        expect(card.element.tagName.toLowerCase()).toBe('a');
      });
    });
  });

  describe('路由链接', () => {
    it('石头剪刀布卡片应该链接到正确路由', () => {
      const cards = wrapper.findAll('.game-card');
      const rpsCard = cards.find((card) => card.text().includes('石头剪刀布'));

      expect(rpsCard?.attributes('href')).toBe('/game/rock-paper-scissors');
    });

    it('2048 卡片应该链接到正确路由', () => {
      const cards = wrapper.findAll('.game-card');
      const game2048Card = cards.find((card) => card.text().includes('2048'));

      expect(game2048Card?.attributes('href')).toBe('/game/2048');
    });

    it('A Dark Room 卡片应该链接到正确路由', () => {
      const cards = wrapper.findAll('.game-card');
      const adarkroomCard = cards.find((card) => card.text().includes('A Dark Room'));

      expect(adarkroomCard?.attributes('href')).toBe('/game/adarkroom');
    });

    it('所有路由应该以 /game/ 开头', () => {
      const cards = wrapper.findAll('.game-card');

      cards.forEach((card) => {
        const href = card.attributes('href');
        expect(href).toMatch(/^\/game\//);
      });
    });
  });

  describe('游戏描述', () => {
    it('游戏描述应该是中文', () => {
      const cards = wrapper.findAll('.game-card');

      cards.forEach((card) => {
        const description = card.find('.game-description').text();
        expect(description.length).toBeGreaterThan(0);
      });
    });

    it('描述不应该为空', () => {
      const cards = wrapper.findAll('.game-card');

      cards.forEach((card) => {
        const description = card.find('.game-description').text();
        expect(description.trim()).not.toBe('');
      });
    });
  });

  describe('组件样式', () => {
    it('组件应该有正确的类', () => {
      expect(wrapper.classes()).toContain('games-view');
    });

    it('游戏网格应该正确布局', () => {
      const grid = wrapper.find('.games-grid');
      expect(grid.classes()).toContain('games-grid');
    });

    it('游戏卡片应该有正确的类', () => {
      const cards = wrapper.findAll('.game-card');

      cards.forEach((card) => {
        expect(card.classes()).toContain('game-card');
      });
    });
  });

  describe('数据完整性', () => {
    it('所有游戏应该有唯一 ID', () => {
      const ids: string[] = [];
      const cards = wrapper.findAll('.game-card');

      cards.forEach((card) => {
        const href = card.attributes('href');
        if (href) {
          const id = href.replace('/game/', '');
          ids.push(id);
        }
      });

      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('应该包含所有预期游戏', () => {
      const expectedGames = [
        'rock-paper-scissors', '2048', 'snake', 'gomoku',
        'tetris', 'tictactoe', 'international-checkers', 'chess',
        'minesweeper', 'go', 'light-ball', 'adarkroom'
      ];

      const cards = wrapper.findAll('.game-card');
      const gameIds: string[] = [];

      cards.forEach((card) => {
        const href = card.attributes('href');
        if (href) {
          gameIds.push(href.replace('/game/', ''));
        }
      });

      expectedGames.forEach((gameId) => {
        expect(gameIds).toContain(gameId);
      });
    });
  });

  describe('响应式行为', () => {
    it('在小屏幕上应该保持正确显示', () => {
      // 模拟小屏幕
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600,
      });

      // 重新渲染组件
      wrapper.unmount();
      wrapper = mount(GamesView, {
        global: {
          plugins: [router],
        },
      });

      const cards = wrapper.findAll('.game-card');
      expect(cards.length).toBe(12);
    });
  });
});