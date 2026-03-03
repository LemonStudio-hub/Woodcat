/**
 * SettingsView 组件集成测试
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import SettingsView from '@/views/SettingsView.vue';

describe('SettingsView', () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    // Mock audioService
    vi.mock('@/services/audioService', () => ({
      audioService: {
        isEnabled: vi.fn(() => true),
        toggle: vi.fn(() => true),
        play: vi.fn(),
      },
      SoundType: {
        CLICK: 'click',
      },
    }));

    // Mock vibrationService
    vi.mock('@/services/vibrationService', () => ({
      vibrationService: {
        isEnabled: vi.fn(() => true),
        toggle: vi.fn(() => true),
        vibrate: vi.fn(),
      },
      VibrationType: {
        CLICK: 'click',
      },
    }));

    wrapper = mount(SettingsView);
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

    it('应该包含设置标题', () => {
      const title = wrapper.find('.settings-title');
      expect(title.exists()).toBe(true);
      expect(title.text()).toBe('设置');
    });

    it('应该包含设置内容区域', () => {
      const content = wrapper.find('.settings-content');
      expect(content.exists()).toBe(true);
    });

    it('应该包含设置区块', () => {
      const section = wrapper.find('.setting-section');
      expect(section.exists()).toBe(true);
    });
  });

  describe('音效设置', () => {
    it('应该包含音效设置项', () => {
      const settingItems = wrapper.findAll('.setting-item');
      expect(settingItems.length).toBeGreaterThanOrEqual(1);
    });

    it('音效设置应该有正确的名称和描述', () => {
      const settingItems = wrapper.findAll('.setting-item');
      const soundSetting = settingItems.find(item => 
        item.find('.setting-name').text() === '音效'
      );

      expect(soundSetting).toBeDefined();
      expect(soundSetting?.find('.setting-description').text()).toBe('开启或关闭游戏音效');
    });

    it('应该包含音效开关按钮', () => {
      const settingItems = wrapper.findAll('.setting-item');
      const soundSetting = settingItems.find(item => 
        item.find('.setting-name').text() === '音效'
      );

      const toggleButton = soundSetting?.find('.setting-toggle');
      expect(toggleButton).toBeDefined();
    });

    it('点击音效开关应该切换音效', async () => {
      const { audioService, SoundType } = await import('@/services/audioService');

      const settingItems = wrapper.findAll('.setting-item');
      const soundSetting = settingItems.find(item => 
        item.find('.setting-name').text() === '音效'
      );

      const toggleButton = soundSetting?.find('.setting-toggle');
      await toggleButton?.trigger('click');

      expect(audioService.toggle).toHaveBeenCalled();
      expect(audioService.play).toHaveBeenCalledWith(SoundType.CLICK);
    });

    it('音效开关应该有正确的 aria-label', () => {
      const settingItems = wrapper.findAll('.setting-item');
      const soundSetting = settingItems.find(item => 
        item.find('.setting-name').text() === '音效'
      );

      const toggleButton = soundSetting?.find('.setting-toggle');
      expect(toggleButton?.attributes('aria-label')).toBe('关闭音效');
    });

    it('音效开关应该有 active 类', () => {
      const { audioService } = await import('@/services/audioService');
      vi.mocked(audioService.isEnabled).mockReturnValue(true);

      wrapper = mount(SettingsView);

      const settingItems = wrapper.findAll('.setting-item');
      const soundSetting = settingItems.find(item => 
        item.find('.setting-name').text() === '音效'
      );

      const toggleButton = soundSetting?.find('.setting-toggle');
      expect(toggleButton?.classes()).toContain('setting-toggle--active');
    });
  });

  describe('震动设置', () => {
    it('应该包含震动设置项', () => {
      const settingItems = wrapper.findAll('.setting-item');
      expect(settingItems.length).toBe(2);
    });

    it('震动设置应该有正确的名称和描述', () => {
      const settingItems = wrapper.findAll('.setting-item');
      const vibrationSetting = settingItems.find(item => 
        item.find('.setting-name').text() === '震动'
      );

      expect(vibrationSetting).toBeDefined();
      expect(vibrationSetting?.find('.setting-description').text()).toBe('开启或关闭游戏震动反馈');
    });

    it('应该包含震动开关按钮', () => {
      const settingItems = wrapper.findAll('.setting-item');
      const vibrationSetting = settingItems.find(item => 
        item.find('.setting-name').text() === '震动'
      );

      const toggleButton = vibrationSetting?.find('.setting-toggle');
      expect(toggleButton).toBeDefined();
    });

    it('点击震动开关应该切换震动', async () => {
      const { vibrationService, VibrationType } = await import('@/services/vibrationService');

      const settingItems = wrapper.findAll('.setting-item');
      const vibrationSetting = settingItems.find(item => 
        item.find('.setting-name').text() === '震动'
      );

      const toggleButton = vibrationSetting?.find('.setting-toggle');
      await toggleButton?.trigger('click');

      expect(vibrationService.toggle).toHaveBeenCalled();
      expect(vibrationService.vibrate).toHaveBeenCalledWith(VibrationType.CLICK);
    });

    it('震动开关应该有正确的 aria-label', () => {
      const settingItems = wrapper.findAll('.setting-item');
      const vibrationSetting = settingItems.find(item => 
        item.find('.setting-name').text() === '震动'
      );

      const toggleButton = vibrationSetting?.find('.setting-toggle');
      expect(toggleButton?.attributes('aria-label')).toBe('关闭震动');
    });

    it('震动开关应该有 active 类', () => {
      const { vibrationService } = await import('@/services/vibrationService');
      vi.mocked(vibrationService.isEnabled).mockReturnValue(true);

      wrapper = mount(SettingsView);

      const settingItems = wrapper.findAll('.setting-item');
      const vibrationSetting = settingItems.find(item => 
        item.find('.setting-name').text() === '震动'
      );

      const toggleButton = vibrationSetting?.find('.setting-toggle');
      expect(toggleButton?.classes()).toContain('setting-toggle--active');
    });
  });

  describe('开关样式', () => {
    it('开关应该包含滑块', () => {
      const toggleButtons = wrapper.findAll('.setting-toggle');
      
      toggleButtons.forEach(button => {
        expect(button.find('.toggle-slider').exists()).toBe(true);
      });
    });

    it('禁用的开关不应该有 active 类', async () => {
      const { audioService } = await import('@/services/audioService');
      vi.mocked(audioService.isEnabled).mockReturnValue(false);

      wrapper = mount(SettingsView);

      const settingItems = wrapper.findAll('.setting-item');
      const soundSetting = settingItems.find(item => 
        item.find('.setting-name').text() === '音效'
      );

      const toggleButton = soundSetting?.find('.setting-toggle');
      expect(toggleButton?.classes()).not.toContain('setting-toggle--active');
    });
  });

  describe('组件挂载', () => {
    it('应该在挂载时同步服务状态', async () => {
      const { audioService, vibrationService } = await import('@/services/audioService');

      wrapper = mount(SettingsView);

      expect(audioService.isEnabled).toHaveBeenCalled();
      expect(vibrationService.isEnabled).toHaveBeenCalled();
    });
  });

  describe('组件样式', () => {
    it('组件应该有正确的类', () => {
      expect(wrapper.classes()).toContain('settings-view');
    });

    it('设置区块应该有正确的类', () => {
      const section = wrapper.find('.setting-section');
      expect(section.classes()).toContain('setting-section');
    });

    it('设置项应该有正确的类', () => {
      const settingItems = wrapper.findAll('.setting-item');
      
      settingItems.forEach(item => {
        expect(item.classes()).toContain('setting-item');
      });
    });

    it('设置信息应该有正确的类', () => {
      const settingItems = wrapper.findAll('.setting-item');
      
      settingItems.forEach(item => {
        expect(item.find('.setting-info').classes()).toContain('setting-info');
        expect(item.find('.setting-details').classes()).toContain('setting-details');
      });
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
      wrapper = mount(SettingsView);

      const settingItems = wrapper.findAll('.setting-item');
      expect(settingItems.length).toBe(2);
    });
  });
});