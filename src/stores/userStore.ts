/**
 * 用户状态管理
 * 管理用户登录状态和用户信息
 */

import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface User {
  id: number;
  email: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
}

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:8787';

  /**
   * 从 localStorage 加载用户信息
   */
  function loadUserFromStorage() {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      user.value = JSON.parse(storedUser);
      token.value = storedToken;
    }
  }

  /**
   * 保存用户信息到 localStorage
   */
  function saveUserToStorage() {
    if (user.value && token.value) {
      localStorage.setItem('user', JSON.stringify(user.value));
      localStorage.setItem('token', token.value);
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }

  /**
   * 注册
   */
  async function register(email: string, username: string, password: string, turnstileToken: string) {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, username, password, turnstileToken }),
      });

      const data: any = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '注册失败');
      }

      user.value = data.user;
      token.value = data.token;
      saveUserToStorage();

      return { success: true, message: data.message };
    } catch (err) {
      error.value = err instanceof Error ? err.message : '注册失败';
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * 登录
   */
  async function login(email: string, password: string, turnstileToken: string) {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, turnstileToken }),
      });

      const data: any = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '登录失败');
      }

      user.value = data.user;
      token.value = data.token;
      saveUserToStorage();

      return { success: true, message: data.message };
    } catch (err) {
      error.value = err instanceof Error ? err.message : '登录失败';
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * 登出
   */
  async function logout() {
    try {
      if (token.value) {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token.value}`,
          },
        });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      user.value = null;
      token.value = null;
      saveUserToStorage();
    }
  }

  /**
   * 更新用户资料
   */
  async function updateProfile(username?: string, bio?: string, avatarUrl?: string) {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.value}`,
        },
        body: JSON.stringify({ username, bio, avatarUrl }),
      });

      const data: any = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '更新失败');
      }

      user.value = data.user;
      saveUserToStorage();

      return { success: true, message: data.message };
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新失败';
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * 验证 token
   */
  async function verifyToken() {
    if (!token.value) {
      return { valid: false };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token.value}`,
        },
      });

      const data: any = await response.json();

      if (!response.ok || !data.valid) {
        logout();
        return { valid: false };
      }

      user.value = data.user;
      return { valid: true };
    } catch (err) {
      logout();
      return { valid: false };
    }
  }

  // 初始化时从 localStorage 加载用户信息
  loadUserFromStorage();

  return {
    user,
    token,
    isLoading,
    error,
    register,
    login,
    logout,
    updateProfile,
    verifyToken,
  };
});