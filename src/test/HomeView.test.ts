/**
 * HomeView 组件集成测试
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';

describe('HomeView', () => {
  let wrapper: VueWrapper;
  let router: any;

  beforeEach(() => {
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: HomeView },
        { path: '/game/:id', component: { template: '<div>Game</div>' } },
      ],
    });

    // Mock BroadcastChannel
    global.BroadcastChannel = class {
      constructor(name: string) {
        this.name = name;
      }
      postMessage(message: any) {}
      close() {}
    } as any;

    // Mock window.open
    window.open = vi.fn(() => ({ closed: false })) as any;

    wrapper = mount(HomeView, {
      global: {
        plugins: [router],
      },
    });
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
    vi.clearAllMocks();
  });

  describe('组件渲染', () => {
    it('应该正确渲染组件', () => {
      expect(wrapper.exists()).toBe(true);
    });

    it('应该包含英雄区域', () => {
      const heroSection = wrapper.find('.hero-section');
      expect(heroSection.exists()).toBe(true);
    });

    it('应该包含英雄图标', () => {
      const heroIcon = wrapper.find('.hero-icon');
      expect(heroIcon.exists()).toBe(true);
      expect(heroIcon.text()).toBe('🐱');
    });

    it('应该包含标题', () => {
      const heroTitle = wrapper.find('.hero-title');
      expect(heroTitle.exists()).toBe(true);
      expect(heroTitle.text()).toBe('木头猫');
    });

    it('应该包含副标题', () => {
      const heroSubtitle = wrapper.find('.hero-subtitle');
      expect(heroSubtitle.exists()).toBe(true);
      expect(heroSubtitle.text()).toBe('极简黑白风格小游戏合集');
    });

    it('应该包含开始游戏按钮', () => {
      const heroButton = wrapper.find('.hero-button');
      expect(heroButton.exists()).toBe(true);
      expect(heroButton.text()).toBe('开始游戏');
    });

    it('应该包含游戏列表区域', () => {
      const gamesSection = wrapper.find('.games-section');
      expect(gamesSection.exists()).toBe(true);
    });

    it('应该包含游戏列表标题', () => {
      const sectionTitle = wrapper.find('.section-title');
      expect(sectionTitle.exists()).toBe(true);
      expect(sectionTitle.text()).toBe('游戏列表');
    });

    it('应该包含游戏网格', () => {
      const gamesGrid = wrapper.find('.games-grid');
      expect(gamesGrid.exists()).toBe(true);
    });
  });

  describe('游戏列表', () => {
    it('应该渲染 12 个游戏卡片', () => {
      const gameCards = wrapper.findAll('.game-card');
      expect(gameCards.length).toBe(12);
    });

    it('每个游戏卡片应该有必需的元素', () => {
      const gameCards = wrapper.findAll('.game-card');

      gameCards.forEach((card) => {
        expect(card.find('.game-card-title').exists()).toBe(true);
        expect(card.find('.game-card-description').exists()).toBe(true);
        expect(card.find('.game-card-link').exists()).toBe(true);
      });
    });

    it('游戏卡片应该显示正确的标题', () => {
      const expectedTitles = [
        '石头剪刀布', '2048', '贪吃蛇', '五子棋',
        '俄罗斯方块', '井字棋', '国际跳棋', '国际象棋',
        '扫雷', '围棋', '光球', 'A Dark Room'
      ];

      const gameCards = wrapper.findAll('.game-card');
      const titles = gameCards.map(card => card.find('.game-card-title').text());

      expectedTitles.forEach(title => {
        expect(titles).toContain(title);
      });
    });

    it('游戏卡片应该显示正确的描述', () => {
      const gameCards = wrapper.findAll('.game-card');

      gameCards.forEach(card => {
        const description = card.find('.game-card-description').text();
        expect(description.length).toBeGreaterThan(0);
      });
    });

    it('游戏卡片应该显示进入游戏链接', () => {
      const gameCards = wrapper.findAll('.game-card');

      gameCards.forEach(card => {
        const link = card.find('.game-card-link');
        expect(link.text()).toContain('进入游戏');
      });
    });
  });

  describe('点击交互', () => {
    it('点击游戏卡片应该打开游戏', async () => {
      const gameCards = wrapper.findAll('.game-card');
      const firstCard = gameCards[0];

      await firstCard.trigger('click');

      expect(window.open).toHaveBeenCalled();
    });

    it('点击开始游戏按钮应该打开随机游戏', async () => {
      const heroButton = wrapper.find('.hero-button');

      await heroButton.trigger('click');

      expect(window.open).toHaveBeenCalled();
    });

    it('点击游戏卡片应该发送 BroadcastChannel 消息', async () => {
      const postMessageSpy = vi.spyOn(BroadcastChannel.prototype, 'postMessage');

      const gameCards = wrapper.findAll('.game-card');
      await gameCards[0].trigger('click');

      expect(postMessageSpy).toHaveBeenCalledWith({
        type: 'close-game',
        gameRoute: expect.any(String),
      });

      postMessageSpy.mockRestore();
    });

    it('点击开始游戏按钮应该发送 BroadcastChannel 消息', async () => {
      const postMessageSpy = vi.spyOn(BroadcastChannel.prototype, 'postMessage');

      const heroButton = wrapper.find('.hero-button');
      await heroButton.trigger('click');

      expect(postMessageSpy).toHaveBeenCalledWith({
        type: 'close-game',
        gameRoute: expect.any(String),
      });

      postMessageSpy.mockRestore();
    });

    it('点击游戏卡片应该关闭 BroadcastChannel', async () => {
      const closeSpy = vi.spyOn(BroadcastChannel.prototype, 'close');

      const gameCards = wrapper.findAll('.game-card');
      await gameCards[0].trigger('click');

      expect(closeSpy).toHaveBeenCalled();

      closeSpy.mockRestore();
    });
  });

  describe('随机游戏选择', () => {
    it('开始游戏按钮应该打开随机游戏', async () => {
      const heroButton = wrapper.find('.hero-button');
      await heroButton.trigger('click');

      expect(window.open).toHaveBeenCalledWith(expect.stringMatching(/^\/game\//), '_blank');
    });

    it('随机游戏应该在游戏列表中', async () => {
      const heroButton = wrapper.find('.hero-button');
      await heroButton.trigger('click');

      const gameRoutes = [
        '/game/rock-paper-scissors', '/game/2048', '/game/snake', '/game/gomoku',
        '/game/tetris', '/game/tictactoe', '/game/international-checkers', '/game/chess',
        '/game/minesweeper', '/game/go', '/game/light-ball', '/game/adarkroom'
      ];

      const openCalls = vi.mocked(window.open).mock.calls;
      const lastCall = openCalls[openCalls.length - 1];
      const openedRoute = lastCall[0];

      expect(gameRoutes).toContain(openedRoute);
    });
  });

  describe('窗口打开失败处理', () => {
    it('如果 window.open 失败，应该使用当前窗口跳转', async () => {
      // Mock window.open 返回 null（被浏览器阻止）
      vi.mocked(window.open).mockReturnValue(null as any);

      const locationSpy = vi.spyOn(window.location, 'href', 'set');

      const heroButton = wrapper.find('.hero-button');
      await heroButton.trigger('click');

      expect(locationSpy).toHaveBeenCalled();

      locationSpy.mockRestore();
      vi.mocked(window.open).mockReturnValue({ closed: false } as any);
    });
  });

  describe('组件样式', () => {
    it('组件应该有正确的类', () => {
      expect(wrapper.classes()).toContain('home-view');
    });

    it('英雄区域应该有正确的样式', () => {
      const heroSection = wrapper.find('.hero-section');
      expect(heroSection.classes()).toContain('hero-section');
    });

    it('英雄图标应该有动画类', () => {
      const heroIcon = wrapper.find('.hero-icon');
      expect(heroIcon.classes()).toContain('hero-icon');
    });

    it('开始游戏按钮应该有正确的样式', () => {
      const heroButton = wrapper.find('.hero-button');
      expect(heroButton.classes()).toContain('hero-button');
    });
  });

  describe('响应式行为', () => {
    it('在小屏幕上应该保持正确显示', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600,
      });

      wrapper.unmount();
      wrapper = mount(HomeView, {
        global: {
          plugins: [router],
        },
      });

      const gameCards = wrapper.findAll('.game-card');
      expect(gameCards.length).toBe(12);
    });

    it('在大屏幕上应该显示网格布局', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      });

      wrapper.unmount();
      wrapper = mount(HomeView, {
        global: {
          plugins: [router],
        },
      });

      const gamesGrid = wrapper.find('.games-grid');
      expect(gamesGrid.exists()).toBe(true);
    });
  });

  describe('数据完整性', () => {
    it('所有游戏应该有唯一路由', () => {
      const gameCards = wrapper.findAll('.game-card');
      const routes: string[] = [];

      // 点击每个卡片并检查路由
      gameCards.forEach(async (card) => {
        await card.trigger('click');
        const openCalls = vi.mocked(window.open).mock.calls;
        if (openCalls.length > 0) {
          routes.push(openCalls[openCalls.length - 1][0]);
        }
      });

      const uniqueRoutes = new Set(routes);
      expect(uniqueRoutes.size).toBe(routes.length);
    });
  });
});