/**
 * RegisterView 组件集成测试
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import { createPinia, setActivePinia } from 'pinia';
import RegisterView from '@/views/RegisterView.vue';

describe('RegisterView', () => {
  let wrapper: VueWrapper;
  let router: any;
  let pinia: any;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);

    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/register', component: RegisterView },
        { path: '/login', component: { template: '<div>Login</div>' } },
        { path: '/', component: { template: '<div>Home</div>' } },
      ],
    });

    // Mock userStore
    vi.mock('@/stores/userStore', () => ({
      useUserStore: () => ({
        register: vi.fn(),
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

    wrapper = mount(RegisterView, {
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

    it('应该包含注册标题', () => {
      const title = wrapper.find('.register-title');
      expect(title.exists()).toBe(true);
      expect(title.text()).toBe('注册');
    });

    it('应该包含注册表单', () => {
      const form = wrapper.find('.register-form');
      expect(form.exists()).toBe(true);
    });

    it('应该包含邮箱输入框', () => {
      const emailInput = wrapper.find('#email');
      expect(emailInput.exists()).toBe(true);
      expect(emailInput.attributes('type')).toBe('email');
    });

    it('应该包含用户名输入框', () => {
      const usernameInput = wrapper.find('#username');
      expect(usernameInput.exists()).toBe(true);
      expect(usernameInput.attributes('type')).toBe('text');
    });

    it('应该包含密码输入框', () => {
      const passwordInput = wrapper.find('#password');
      expect(passwordInput.exists()).toBe(true);
      expect(passwordInput.attributes('type')).toBe('password');
    });

    it('应该包含确认密码输入框', () => {
      const confirmPasswordInput = wrapper.find('#confirmPassword');
      expect(confirmPasswordInput.exists()).toBe(true);
      expect(confirmPasswordInput.attributes('type')).toBe('password');
    });

    it('应该包含提交按钮', () => {
      const submitButton = wrapper.find('.submit-button');
      expect(submitButton.exists()).toBe(true);
      expect(submitButton.text()).toBe('注册');
    });

    it('应该包含登录链接', () => {
      const footer = wrapper.find('.register-footer');
      expect(footer.exists()).toBe(true);
      expect(footer.text()).toContain('已有账号？');
      expect(footer.text()).toContain('立即登录');
    });
  });

  describe('表单验证', () => {
    it('所有输入框都应该支持双向绑定', async () => {
      const emailInput = wrapper.find('#email');
      const usernameInput = wrapper.find('#username');
      const passwordInput = wrapper.find('#password');
      const confirmPasswordInput = wrapper.find('#confirmPassword');

      await emailInput.setValue('test@example.com');
      await usernameInput.setValue('testuser');
      await passwordInput.setValue('password123');
      await confirmPasswordInput.setValue('password123');

      expect((emailInput.element as HTMLInputElement).value).toBe('test@example.com');
      expect((usernameInput.element as HTMLInputElement).value).toBe('testuser');
      expect((passwordInput.element as HTMLInputElement).value).toBe('password123');
      expect((confirmPasswordInput.element as HTMLInputElement).value).toBe('password123');
    });

    it('用户名输入框应该有最小长度限制', () => {
      const usernameInput = wrapper.find('#username');
      expect(usernameInput.attributes('minlength')).toBe('3');
    });

    it('用户名输入框应该有最大长度限制', () => {
      const usernameInput = wrapper.find('#username');
      expect(usernameInput.attributes('maxlength')).toBe('20');
    });

    it('密码输入框应该有最小长度限制', () => {
      const passwordInput = wrapper.find('#password');
      expect(passwordInput.attributes('minlength')).toBe('6');
    });

    it('所有输入框都应该是必填的', () => {
      const emailInput = wrapper.find('#email');
      const usernameInput = wrapper.find('#username');
      const passwordInput = wrapper.find('#password');
      const confirmPasswordInput = wrapper.find('#confirmPassword');

      expect(emailInput.attributes('required')).toBeDefined();
      expect(usernameInput.attributes('required')).toBeDefined();
      expect(passwordInput.attributes('required')).toBeDefined();
      expect(confirmPasswordInput.attributes('required')).toBeDefined();
    });
  });

  describe('密码验证', () => {
    it('密码不一致时应该显示错误', async () => {
      const passwordInput = wrapper.find('#password');
      const confirmPasswordInput = wrapper.find('#confirmPassword');
      const form = wrapper.find('.register-form');

      await passwordInput.setValue('password123');
      await confirmPasswordInput.setValue('password456');
      await form.trigger('submit');

      const errorMessage = wrapper.find('.error-message');
      expect(errorMessage.exists()).toBe(true);
      expect(errorMessage.text()).toBe('两次输入的密码不一致');
    });

    it('密码一致时应该提交表单', async () => {
      const { useUserStore } = await import('@/stores/userStore');
      const userStore = useUserStore();

      vi.mocked(userStore.register).mockResolvedValue({ success: true });

      const emailInput = wrapper.find('#email');
      const usernameInput = wrapper.find('#username');
      const passwordInput = wrapper.find('#password');
      const confirmPasswordInput = wrapper.find('#confirmPassword');
      const form = wrapper.find('.register-form');

      await emailInput.setValue('test@example.com');
      await usernameInput.setValue('testuser');
      await passwordInput.setValue('password123');
      await confirmPasswordInput.setValue('password123');
      await form.trigger('submit');

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(userStore.register).toHaveBeenCalledWith(
        'test@example.com',
        'testuser',
        'password123',
        expect.any(String)
      );
    });

    it('密码错误后应该重置加载状态', async () => {
      const passwordInput = wrapper.find('#password');
      const confirmPasswordInput = wrapper.find('#confirmPassword');
      const form = wrapper.find('.register-form');

      await passwordInput.setValue('password123');
      await confirmPasswordInput.setValue('password456');
      await form.trigger('submit');

      const submitButton = wrapper.find('.submit-button');
      expect(submitButton.text()).toBe('注册');
    });
  });

  describe('注册提交', () => {
    it('注册成功应该跳转到首页', async () => {
      const { useUserStore } = await import('@/stores/userStore');
      const userStore = useUserStore();

      vi.mocked(userStore.register).mockResolvedValue({ success: true });

      const emailInput = wrapper.find('#email');
      const usernameInput = wrapper.find('#username');
      const passwordInput = wrapper.find('#password');
      const confirmPasswordInput = wrapper.find('#confirmPassword');
      const form = wrapper.find('.register-form');

      await emailInput.setValue('test@example.com');
      await usernameInput.setValue('testuser');
      await passwordInput.setValue('password123');
      await confirmPasswordInput.setValue('password123');
      await form.trigger('submit');

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(router.currentRoute.value.path).toBe('/');
    });

    it('注册失败应该显示错误消息', async () => {
      const { useUserStore } = await import('@/stores/userStore');
      const userStore = useUserStore();

      vi.mocked(userStore.register).mockResolvedValue({
        success: false,
        error: '邮箱已被注册',
      });

      const emailInput = wrapper.find('#email');
      const usernameInput = wrapper.find('#username');
      const passwordInput = wrapper.find('#password');
      const confirmPasswordInput = wrapper.find('#confirmPassword');
      const form = wrapper.find('.register-form');

      await emailInput.setValue('existing@example.com');
      await usernameInput.setValue('testuser');
      await passwordInput.setValue('password123');
      await confirmPasswordInput.setValue('password123');
      await form.trigger('submit');

      await new Promise(resolve => setTimeout(resolve, 100));

      const errorMessage = wrapper.find('.error-message');
      expect(errorMessage.exists()).toBe(true);
      expect(errorMessage.text()).toBe('邮箱已被注册');
    });
  });

  describe('按钮状态', () => {
    it('提交按钮在加载时应该被禁用', async () => {
      const { useUserStore } = await import('@/stores/userStore');
      const userStore = useUserStore();

      vi.mocked(userStore.register).mockImplementation(() => {
        return new Promise(() => {});
      });

      const emailInput = wrapper.find('#email');
      const usernameInput = wrapper.find('#username');
      const passwordInput = wrapper.find('#password');
      const confirmPasswordInput = wrapper.find('#confirmPassword');
      const form = wrapper.find('.register-form');

      await emailInput.setValue('test@example.com');
      await usernameInput.setValue('testuser');
      await passwordInput.setValue('password123');
      await confirmPasswordInput.setValue('password123');
      await form.trigger('submit');

      await new Promise(resolve => setTimeout(resolve, 50));

      const submitButton = wrapper.find('.submit-button');
      expect(submitButton.attributes('disabled')).toBeDefined();
      expect(submitButton.text()).toBe('注册中...');
    });

    it('提交按钮在无 Turnstile token 时应该被禁用', () => {
      const submitButton = wrapper.find('.submit-button');
      expect(submitButton.attributes('disabled')).toBeDefined();
    });
  });

  describe('组件样式', () => {
    it('组件应该有正确的类', () => {
      expect(wrapper.classes()).toContain('register-page');
    });

    it('注册卡片应该有正确的类', () => {
      const registerCard = wrapper.find('.register-card');
      expect(registerCard.classes()).toContain('register-card');
    });

    it('表单应该有正确的类', () => {
      const form = wrapper.find('.register-form');
      expect(form.classes()).toContain('register-form');
    });
  });

  describe('导航', () => {
    it('登录链接应该指向登录页面', () => {
      const link = wrapper.findComponent({ name: 'RouterLink' });
      expect(link.props().to).toBe('/login');
    });
  });

  describe('用户名验证', () => {
    it('用户名长度不足3个字符时应该显示验证错误', async () => {
      const usernameInput = wrapper.find('#username');
      await usernameInput.setValue('ab');

      expect((usernameInput.element as HTMLInputElement).value.length).toBeLessThan(3);
    });

    it('用户名长度超过20个字符时应该被截断', async () => {
      const usernameInput = wrapper.find('#username');
      const longName = 'a'.repeat(25);
      await usernameInput.setValue(longName);

      const value = (usernameInput.element as HTMLInputElement).value;
      expect(value.length).toBeLessThanOrEqual(20);
    });
  });

  describe('密码验证', () => {
    it('密码长度不足6个字符时应该显示验证错误', async () => {
      const passwordInput = wrapper.find('#password');
      await passwordInput.setValue('12345');

      expect((passwordInput.element as HTMLInputElement).value.length).toBeLessThan(6);
    });

    it('密码长度符合要求时应该允许输入', async () => {
      const passwordInput = wrapper.find('#password');
      await passwordInput.setValue('123456');

      expect((passwordInput.element as HTMLInputElement).value.length).toBeGreaterThanOrEqual(6);
    });
  });
});