/**
 * ProfileView 组件集成测试
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import { createPinia, setActivePinia } from 'pinia';
import ProfileView from '@/views/ProfileView.vue';

describe('ProfileView', () => {
  let wrapper: VueWrapper;
  let router: any;
  let pinia: any;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);

    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/profile', component: ProfileView },
        { path: '/', component: { template: '<div>Home</div>' } },
      ],
    });

    // Mock userStore
    vi.mock('@/stores/userStore', () => ({
      useUserStore: () => ({
        user: null,
        login: vi.fn(),
        register: vi.fn(),
        updateProfile: vi.fn(),
      }),
    }));

    // Mock window.turnstile
    (window as any).turnstile = {
      render: vi.fn(() => 'mock-token'),
      remove: vi.fn(),
    };

    // Mock import.meta.env
    (import.meta as any).env = {
      VITE_TURNSTILE_SITE_KEY: 'test-site-key',
    };

    wrapper = mount(ProfileView, {
      global: {
        plugins: [router, pinia],
      },
    });
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
    vi.clearAllMocks();
  });

  describe('未登录状态', () => {
    it('应该正确渲染未登录状态', () => {
      expect(wrapper.exists()).toBe(true);
    });

    it('应该包含认证标签页', () => {
      const tabs = wrapper.findAll('.auth-tab');
      expect(tabs.length).toBe(2);
    });

    it('应该包含登录和注册标签', () => {
      const tabs = wrapper.findAll('.auth-tab');
      expect(tabs[0].text()).toBe('登录');
      expect(tabs[1].text()).toBe('注册');
    });

    it('登录标签应该默认激活', () => {
      const tabs = wrapper.findAll('.auth-tab');
      expect(tabs[0].classes()).toContain('auth-tab--active');
    });

    it('点击注册标签应该激活注册标签', async () => {
      const tabs = wrapper.findAll('.auth-tab');
      await tabs[1].trigger('click');

      expect(tabs[1].classes()).toContain('auth-tab--active');
      expect(tabs[0].classes()).not.toContain('auth-tab--active');
    });

    it('应该显示登录表单', () => {
      const authSection = wrapper.find('.auth-section');
      expect(authSection.exists()).toBe(true);
    });

    it('应该显示登录标题', () => {
      const title = wrapper.find('.auth-title');
      expect(title.exists()).toBe(true);
      expect(title.text()).toBe('登录');
    });

    it('应该包含登录表单字段', () => {
      const emailInput = wrapper.find('#login-email');
      const passwordInput = wrapper.find('#login-password');

      expect(emailInput.exists()).toBe(true);
      expect(passwordInput.exists()).toBe(true);
    });
  });

  describe('登录功能', () => {
    it('应该能够提交登录表单', async () => {
      const { useUserStore } = await import('@/stores/userStore');
      const userStore = useUserStore();

      const emailInput = wrapper.find('#login-email');
      const passwordInput = wrapper.find('#login-password');
      const form = wrapper.find('.auth-form');

      await emailInput.setValue('test@example.com');
      await passwordInput.setValue('password123');
      await form.trigger('submit');

      expect(userStore.login).toHaveBeenCalledWith('test@example.com', 'password123', expect.any(String));
    });

    it('登录成功应该跳转到首页', async () => {
      const { useUserStore } = await import('@/stores/userStore');
      const userStore = useUserStore();

      vi.mocked(userStore.login).mockResolvedValue({ success: true });

      const emailInput = wrapper.find('#login-email');
      const passwordInput = wrapper.find('#login-password');
      const form = wrapper.find('.auth-form');

      await emailInput.setValue('test@example.com');
      await passwordInput.setValue('password123');
      await form.trigger('submit');

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(router.currentRoute.value.path).toBe('/');
    });

    it('登录失败应该显示错误消息', async () => {
      const { useUserStore } = await import('@/stores/userStore');
      const userStore = useUserStore();

      vi.mocked(userStore.login).mockResolvedValue({
        success: false,
        error: '用户名或密码错误',
      });

      const emailInput = wrapper.find('#login-email');
      const passwordInput = wrapper.find('#login-password');
      const form = wrapper.find('.auth-form');

      await emailInput.setValue('test@example.com');
      await passwordInput.setValue('wrongpassword');
      await form.trigger('submit');

      await new Promise(resolve => setTimeout(resolve, 100));

      const errorMessage = wrapper.find('.error-message');
      expect(errorMessage.exists()).toBe(true);
      expect(errorMessage.text()).toBe('用户名或密码错误');
    });
  });

  describe('注册功能', () => {
    beforeEach(async () => {
      // 切换到注册标签
      const tabs = wrapper.findAll('.auth-tab');
      await tabs[1].trigger('click');
      await new Promise(resolve => setTimeout(resolve, 200));
    });

    it('应该显示注册表单', () => {
      const title = wrapper.find('.auth-title');
      expect(title.exists()).toBe(true);
      expect(title.text()).toBe('注册');
    });

    it('应该包含注册表单字段', () => {
      const emailInput = wrapper.find('#register-email');
      const usernameInput = wrapper.find('#register-username');
      const passwordInput = wrapper.find('#register-password');
      const confirmPasswordInput = wrapper.find('#register-confirmPassword');

      expect(emailInput.exists()).toBe(true);
      expect(usernameInput.exists()).toBe(true);
      expect(passwordInput.exists()).toBe(true);
      expect(confirmPasswordInput.exists()).toBe(true);
    });

    it('密码不一致时应该显示错误', async () => {
      const passwordInput = wrapper.find('#register-password');
      const confirmPasswordInput = wrapper.find('#register-confirmPassword');
      const form = wrapper.find('.auth-form');

      await passwordInput.setValue('password123');
      await confirmPasswordInput.setValue('password456');
      await form.trigger('submit');

      const errorMessage = wrapper.find('.error-message');
      expect(errorMessage.exists()).toBe(true);
      expect(errorMessage.text()).toBe('两次输入的密码不一致');
    });

    it('注册成功应该跳转到首页', async () => {
      const { useUserStore } = await import('@/stores/userStore');
      const userStore = useUserStore();

      vi.mocked(userStore.register).mockResolvedValue({ success: true });

      const emailInput = wrapper.find('#register-email');
      const usernameInput = wrapper.find('#register-username');
      const passwordInput = wrapper.find('#register-password');
      const confirmPasswordInput = wrapper.find('#register-confirmPassword');
      const form = wrapper.find('.auth-form');

      await emailInput.setValue('test@example.com');
      await usernameInput.setValue('testuser');
      await passwordInput.setValue('password123');
      await confirmPasswordInput.setValue('password123');
      await form.trigger('submit');

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(router.currentRoute.value.path).toBe('/');
    });
  });

  describe('组件样式', () => {
    it('组件应该有正确的类', () => {
      expect(wrapper.classes()).toContain('profile-page');
    });

    it('个人资料卡片应该有正确的类', () => {
      const card = wrapper.find('.profile-card');
      expect(card.classes()).toContain('profile-card');
    });

    it('表单应该有正确的类', () => {
      const form = wrapper.find('.auth-form');
      expect(form.classes()).toContain('auth-form');
    });
  });

  describe('Turnstile', () => {
    it('应该渲染 Turnstile widget', () => {
      expect((window as any).turnstile.render).toHaveBeenCalled();
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
      wrapper = mount(ProfileView, {
        global: {
          plugins: [router, pinia],
        },
      });

      const card = wrapper.find('.profile-card');
      expect(card.exists()).toBe(true);
    });
  });
});