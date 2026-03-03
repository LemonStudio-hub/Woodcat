/**
 * LoginView 组件集成测试
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import { createPinia, setActivePinia } from 'pinia';
import LoginView from '@/views/LoginView.vue';

describe('LoginView', () => {
  let wrapper: VueWrapper;
  let router: any;
  let pinia: any;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);

    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/login', component: LoginView },
        { path: '/register', component: { template: '<div>Register</div>' } },
        { path: '/', component: { template: '<div>Home</div>' } },
      ],
    });

    // Mock userStore
    vi.mock('@/stores/userStore', () => ({
      useUserStore: () => ({
        login: vi.fn(),
        user: null,
      }),
    }));

    // Mock window.turnstile
    (window as any).turnstile = {
      render: vi.fn(() => 'mock-token'),
    };

    // Mock import.meta.env
    (import.meta as any).env = {
      VITE_TURNSTILE_SITE_KEY: 'test-site-key',
    };

    wrapper = mount(LoginView, {
      global: {
        plugins: [router, pinia],
        stubs: ['router-link'],
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

    it('应该包含登录标题', () => {
      const title = wrapper.find('.login-title');
      expect(title.exists()).toBe(true);
      expect(title.text()).toBe('登录');
    });

    it('应该包含登录表单', () => {
      const form = wrapper.find('.login-form');
      expect(form.exists()).toBe(true);
    });

    it('应该包含邮箱输入框', () => {
      const emailInput = wrapper.find('#email');
      expect(emailInput.exists()).toBe(true);
      expect(emailInput.attributes('type')).toBe('email');
      expect(emailInput.attributes('placeholder')).toBe('请输入邮箱');
    });

    it('应该包含密码输入框', () => {
      const passwordInput = wrapper.find('#password');
      expect(passwordInput.exists()).toBe(true);
      expect(passwordInput.attributes('type')).toBe('password');
      expect(passwordInput.attributes('placeholder')).toBe('请输入密码');
    });

    it('应该包含提交按钮', () => {
      const submitButton = wrapper.find('.submit-button');
      expect(submitButton.exists()).toBe(true);
      expect(submitButton.text()).toBe('登录');
    });

    it('应该包含 Turnstile 容器', () => {
      const turnstileContainer = wrapper.find('.turnstile-container');
      expect(turnstileContainer.exists()).toBe(true);
    });

    it('应该包含注册链接', () => {
      const footer = wrapper.find('.login-footer');
      expect(footer.exists()).toBe(true);
      expect(footer.text()).toContain('还没有账号？');
      expect(footer.text()).toContain('立即注册');
    });
  });

  describe('表单验证', () => {
    it('邮箱输入框应该支持双向绑定', async () => {
      const emailInput = wrapper.find('#email');
      await emailInput.setValue('test@example.com');

      expect((emailInput.element as HTMLInputElement).value).toBe('test@example.com');
    });

    it('密码输入框应该支持双向绑定', async () => {
      const passwordInput = wrapper.find('#password');
      await passwordInput.setValue('password123');

      expect((passwordInput.element as HTMLInputElement).value).toBe('password123');
    });

    it('邮箱输入框应该是必填的', () => {
      const emailInput = wrapper.find('#email');
      expect(emailInput.attributes('required')).toBeDefined();
    });

    it('密码输入框应该是必填的', () => {
      const passwordInput = wrapper.find('#password');
      expect(passwordInput.attributes('required')).toBeDefined();
    });
  });

  describe('登录提交', () => {
    it('应该能够提交登录表单', async () => {
      const { useUserStore } = await import('@/stores/userStore');
      const userStore = useUserStore();

      const emailInput = wrapper.find('#email');
      const passwordInput = wrapper.find('#password');
      const form = wrapper.find('.login-form');

      await emailInput.setValue('test@example.com');
      await passwordInput.setValue('password123');
      await form.trigger('submit');

      expect(userStore.login).toHaveBeenCalledWith('test@example.com', 'password123', expect.any(String));
    });

    it('登录成功应该跳转到首页', async () => {
      const { useUserStore } = await import('@/stores/userStore');
      const userStore = useUserStore();

      vi.mocked(userStore.login).mockResolvedValue({ success: true });

      const emailInput = wrapper.find('#email');
      const passwordInput = wrapper.find('#password');
      const form = wrapper.find('.login-form');

      await emailInput.setValue('test@example.com');
      await passwordInput.setValue('password123');
      await form.trigger('submit');

      // 等待异步操作完成
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

      const emailInput = wrapper.find('#email');
      const passwordInput = wrapper.find('#password');
      const form = wrapper.find('.login-form');

      await emailInput.setValue('test@example.com');
      await passwordInput.setValue('wrongpassword');
      await form.trigger('submit');

      // 等待异步操作完成
      await new Promise(resolve => setTimeout(resolve, 100));

      const errorMessage = wrapper.find('.error-message');
      expect(errorMessage.exists()).toBe(true);
      expect(errorMessage.text()).toBe('用户名或密码错误');
    });
  });

  describe('按钮状态', () => {
    it('提交按钮在加载时应该被禁用', async () => {
      const { useUserStore } = await import('@/stores/userStore');
      const userStore = useUserStore();

      // Mock login 返回一个不立即 resolve 的 Promise
      vi.mocked(userStore.login).mockImplementation(() => {
        return new Promise(() => {});
      });

      const emailInput = wrapper.find('#email');
      const passwordInput = wrapper.find('#password');
      const form = wrapper.find('.login-form');

      await emailInput.setValue('test@example.com');
      await passwordInput.setValue('password123');
      await form.trigger('submit');

      await new Promise(resolve => setTimeout(resolve, 50));

      const submitButton = wrapper.find('.submit-button');
      expect(submitButton.attributes('disabled')).toBeDefined();
      expect(submitButton.text()).toBe('登录中...');
    });

    it('提交按钮在无 Turnstile token 时应该被禁用', () => {
      const submitButton = wrapper.find('.submit-button');
      expect(submitButton.attributes('disabled')).toBeDefined();
    });
  });

  describe('Turnstile', () => {
    it('应该加载 Turnstile 脚本', () => {
      const scripts = document.querySelectorAll('script[src*="turnstile"]');
      expect(scripts.length).toBeGreaterThan(0);
    });

    it('应该渲染 Turnstile widget', () => {
      expect((window as any).turnstile.render).toHaveBeenCalled();
    });
  });

  describe('组件样式', () => {
    it('组件应该有正确的类', () => {
      expect(wrapper.classes()).toContain('login-page');
    });

    it('登录卡片应该有正确的类', () => {
      const loginCard = wrapper.find('.login-card');
      expect(loginCard.classes()).toContain('login-card');
    });

    it('表单应该有正确的类', () => {
      const form = wrapper.find('.login-form');
      expect(form.classes()).toContain('login-form');
    });
  });

  describe('导航', () => {
    it('注册链接应该指向注册页面', () => {
      const link = wrapper.findComponent({ name: 'RouterLink' });
      expect(link.props().to).toBe('/register');
    });
  });

  describe('错误处理', () => {
    it('应该在登录失败后重置加载状态', async () => {
      const { useUserStore } = await import('@/stores/userStore');
      const userStore = useUserStore();

      vi.mocked(userStore.login).mockResolvedValue({
        success: false,
        error: '登录失败',
      });

      const emailInput = wrapper.find('#email');
      const passwordInput = wrapper.find('#password');
      const form = wrapper.find('.login-form');

      await emailInput.setValue('test@example.com');
      await passwordInput.setValue('wrongpassword');
      await form.trigger('submit');

      await new Promise(resolve => setTimeout(resolve, 100));

      const submitButton = wrapper.find('.submit-button');
      expect(submitButton.text()).toBe('登录');
    });
  });
});