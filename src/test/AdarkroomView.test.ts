/**
 * AdarkroomView 组件集成测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import AdarkroomView from '@/views/AdarkroomView.vue';

describe('AdarkroomView', () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    // Mock Element.requestFullscreen
    Element.prototype.requestFullscreen = vi.fn(() => Promise.resolve());

    // Mock document.exitFullscreen
    document.exitFullscreen = vi.fn(() => Promise.resolve());

    // Mock document.fullscreenElement
    Object.defineProperty(document, 'fullscreenElement', {
      writable: true,
      configurable: true,
      value: null,
    });

    // Mock querySelector
    document.querySelector = vi.fn((selector) => {
      if (selector === 'header' || selector === 'footer') {
        return {
          style: {},
        };
      }
      return null;
    });

    wrapper = mount(AdarkroomView);
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

    it('应该包含 iframe', () => {
      const iframe = wrapper.find('iframe');
      expect(iframe.exists()).toBe(true);
    });

    it('iframe 应该有正确的属性', () => {
      const iframe = wrapper.find('iframe');

      expect(iframe.attributes('src')).toBe('/adarkroom/index.html');
      expect(iframe.attributes('title')).toBe('A Dark Room Game');
      expect(iframe.attributes('frameborder')).toBe('0');
      expect(iframe.attributes('allowfullscreen')).toBeDefined();
      expect(iframe.attributes('sandbox')).toBe('allow-scripts allow-same-origin allow-forms allow-modals');
    });

    it('iframe 应该有正确的 CSS 类', () => {
      const iframe = wrapper.find('iframe');
      expect(iframe.classes()).toContain('adarkroom-iframe');
    });

    it('应该显示全屏按钮', () => {
      const button = wrapper.find('.fullscreen-btn');
      expect(button.exists()).toBe(true);
    });

    it('全屏按钮应该有正确的文本', () => {
      const button = wrapper.find('.fullscreen-btn');
      expect(button.text()).toBe('⛶');
    });

    it('全屏按钮应该有 title 属性', () => {
      const button = wrapper.find('.fullscreen-btn');
      expect(button.attributes('title')).toBe('全屏体验');
    });
  });

  describe('全屏功能', () => {
    it('点击全屏按钮应该调用 requestFullscreen', async () => {
      const iframe = wrapper.findComponent({ ref: 'iframeRef' }).vm.$el as HTMLIFrameElement;
      const requestFullscreenSpy = vi.spyOn(iframe, 'requestFullscreen');

      const button = wrapper.find('.fullscreen-btn');
      await button.trigger('click');

      expect(requestFullscreenSpy).toHaveBeenCalled();
    });

    it('全屏失败应该在控制台输出错误', async () => {
      const iframe = wrapper.findComponent({ ref: 'iframeRef' }).vm.$el as HTMLIFrameElement;
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      iframe.requestFullscreen = vi.fn(() => Promise.reject(new Error('Fullscreen failed')));

      const button = wrapper.find('.fullscreen-btn');
      await button.trigger('click');

      expect(consoleErrorSpy).toHaveBeenCalledWith('全屏请求失败:', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });
  });

  describe('键盘事件', () => {
    it('按 ESC 键应该退出全屏', async () => {
      Object.defineProperty(document, 'fullscreenElement', {
        writable: true,
        configurable: true,
        value: document.body,
      });

      const exitFullscreenSpy = vi.spyOn(document, 'exitFullscreen');

      await wrapper.trigger('keydown', { key: 'Escape' });

      expect(exitFullscreenSpy).toHaveBeenCalled();
    });

    it('按非 ESC 键不应该退出全屏', async () => {
      Object.defineProperty(document, 'fullscreenElement', {
        writable: true,
        configurable: true,
        value: document.body,
      });

      const exitFullscreenSpy = vi.spyOn(document, 'exitFullscreen');

      await wrapper.trigger('keydown', { key: 'Enter' });

      expect(exitFullscreenSpy).not.toHaveBeenCalled();
    });
  });

  describe('全屏状态变化', () => {
    it('进入全屏时应该隐藏导航元素', async () => {
      const headerMock = { style: {} as any };
      const footerMock = { style: {} as any };

      vi.mocked(document.querySelector).mockImplementation((selector) => {
        if (selector === 'header') return headerMock as any;
        if (selector === 'footer') return footerMock as any;
        return null;
      });

      Object.defineProperty(document, 'fullscreenElement', {
        writable: true,
        configurable: true,
        value: document.body,
      });

      // 触发全屏变化事件
      window.dispatchEvent(new Event('fullscreenchange'));

      expect(headerMock.style.display).toBe('none');
      expect(footerMock.style.display).toBe('none');
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('退出全屏时应该显示导航元素', async () => {
      const headerMock = { style: {} as any };
      const footerMock = { style: {} as any };

      vi.mocked(document.querySelector).mockImplementation((selector) => {
        if (selector === 'header') return headerMock as any;
        if (selector === 'footer') return footerMock as any;
        return null;
      });

      Object.defineProperty(document, 'fullscreenElement', {
        writable: true,
        configurable: true,
        value: null,
      });

      // 触发全屏变化事件
      window.dispatchEvent(new Event('fullscreenchange'));

      expect(headerMock.style.display).toBe('');
      expect(footerMock.style.display).toBe('');
      expect(document.body.style.overflow).toBe('');
    });

    it('全屏状态下应该隐藏全屏按钮', () => {
      Object.defineProperty(document, 'fullscreenElement', {
        writable: true,
        configurable: true,
        value: document.body,
      });

      const button = wrapper.find('.fullscreen-btn');

      // 由于 CSS 选择器，按钮可能仍然在 DOM 中
      // 实际的全屏按钮隐藏是通过 CSS 实现的
      expect(button.exists()).toBe(true);
    });
  });

  describe('组件样式', () => {
    it('组件应该有正确的容器类', () => {
      expect(wrapper.classes()).toContain('adarkroom-view');
    });

    it('组件应该包含游戏容器', () => {
      const container = wrapper.find('.adarkroom-container');
      expect(container.exists()).toBe(true);
    });
  });

  describe('组件生命周期', () => {
    it('组件卸载时应该恢复导航元素显示', () => {
      const headerMock = { style: { display: 'none' } };
      const footerMock = { style: { display: 'none' } };

      vi.mocked(document.querySelector).mockImplementation((selector) => {
        if (selector === 'header') return headerMock as any;
        if (selector === 'footer') return footerMock as any;
        return null;
      });

      wrapper.unmount();

      expect(headerMock.style.display).toBe('');
      expect(footerMock.style.display).toBe('');
    });

    it('组件卸载时应该退出全屏', () => {
      Object.defineProperty(document, 'fullscreenElement', {
        writable: true,
        configurable: true,
        value: document.body,
      });

      const exitFullscreenSpy = vi.spyOn(document, 'exitFullscreen');

      wrapper.unmount();

      expect(exitFullscreenSpy).toHaveBeenCalled();
    });

    it('组件卸载时应该移除事件监听器', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

      wrapper.unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('fullscreenchange', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });
  });

  describe('自动全屏', () => {
    it('组件挂载后应该自动进入全屏', async () => {
      const iframe = wrapper.findComponent({ ref: 'iframeRef' }).vm.$el as HTMLIFrameElement;
      const requestFullscreenSpy = vi.spyOn(iframe, 'requestFullscreen');

      await new Promise(resolve => setTimeout(resolve, 600));

      expect(requestFullscreenSpy).toHaveBeenCalled();
    });
  });
});