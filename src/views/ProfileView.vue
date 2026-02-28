<template>
  <div class="profile-page">
    <div class="container">
      <div class="profile-card">
        <!-- 未登录状态 -->
        <template v-if="!userStore.user">
          <div class="auth-tabs">
            <button
              class="auth-tab"
              :class="{ 'auth-tab--active': activeTab === 'login' }"
              @click="activeTab = 'login'"
            >
              登录
            </button>
            <button
              class="auth-tab"
              :class="{ 'auth-tab--active': activeTab === 'register' }"
              @click="activeTab = 'register'"
            >
              注册
            </button>
          </div>

          <!-- 登录表单 -->
          <div v-if="activeTab === 'login'" class="auth-section">
            <h1 class="auth-title">登录</h1>
            <form @submit.prevent="handleLogin" class="auth-form">
              <div class="form-group">
                <label for="login-email" class="form-label">邮箱</label>
                <input
                  id="login-email"
                  v-model="loginForm.email"
                  type="email"
                  class="form-input"
                  placeholder="请输入邮箱"
                  required
                />
              </div>
              <div class="form-group">
                <label for="login-password" class="form-label">密码</label>
                <input
                  id="login-password"
                  v-model="loginForm.password"
                  type="password"
                  class="form-input"
                  placeholder="请输入密码"
                  required
                />
              </div>
              <div class="form-group">
                <div ref="loginTurnstileContainer" class="turnstile-container"></div>
              </div>
              <button type="submit" class="submit-button" :disabled="isLoading || !loginTurnstileToken">
                {{ isLoading ? '登录中...' : '登录' }}
              </button>
              <div v-if="error" class="error-message">{{ error }}</div>
              <div class="switch-auth">
                还没有账号？<a @click="activeTab = 'register'">立即注册</a>
              </div>
            </form>
          </div>

          <!-- 注册表单 -->
          <div v-if="activeTab === 'register'" class="auth-section">
            <h1 class="auth-title">注册</h1>
            <form @submit.prevent="handleRegister" class="auth-form">
              <div class="form-group">
                <label for="register-email" class="form-label">邮箱</label>
                <input
                  id="register-email"
                  v-model="registerForm.email"
                  type="email"
                  class="form-input"
                  placeholder="请输入邮箱"
                  required
                />
              </div>
              <div class="form-group">
                <label for="register-username" class="form-label">昵称</label>
                <input
                  id="register-username"
                  v-model="registerForm.username"
                  type="text"
                  class="form-input"
                  placeholder="请输入昵称（3-20个字符）"
                  minlength="3"
                  maxlength="20"
                  required
                />
              </div>
              <div class="form-group">
                <label for="register-password" class="form-label">密码</label>
                <input
                  id="register-password"
                  v-model="registerForm.password"
                  type="password"
                  class="form-input"
                  placeholder="请输入密码（至少6个字符）"
                  minlength="6"
                  required
                />
              </div>
              <div class="form-group">
                <label for="register-confirmPassword" class="form-label">确认密码</label>
                <input
                  id="register-confirmPassword"
                  v-model="registerForm.confirmPassword"
                  type="password"
                  class="form-input"
                  placeholder="请再次输入密码"
                  required
                />
              </div>
              <div class="form-group">
                <div ref="registerTurnstileContainer" class="turnstile-container"></div>
              </div>
              <button type="submit" class="submit-button" :disabled="isLoading || !registerTurnstileToken">
                {{ isLoading ? '注册中...' : '注册' }}
              </button>
              <div v-if="error" class="error-message">{{ error }}</div>
              <div class="switch-auth">
                已有账号？<a @click="activeTab = 'login'">立即登录</a>
              </div>
            </form>
          </div>
        </template>

        <!-- 已登录状态 -->
        <template v-else>
          <h1 class="profile-title">个人资料</h1>
          <form @submit.prevent="handleSubmit" class="profile-form">
            <div class="avatar-section">
              <div class="avatar">
                {{ userStore.user?.username.charAt(0).toUpperCase() }}
              </div>
              <div class="avatar-info">
                <div class="username">{{ userStore.user?.username }}</div>
                <div class="email">{{ userStore.user?.email }}</div>
              </div>
            </div>
            <div class="form-group">
              <label for="username" class="form-label">昵称</label>
              <input
                id="username"
                v-model="username"
                type="text"
                class="form-input"
                placeholder="请输入昵称（3-20个字符）"
                minlength="3"
                maxlength="20"
              />
            </div>
            <div class="form-group">
              <label for="bio" class="form-label">个人简介</label>
              <textarea
                id="bio"
                v-model="bio"
                class="form-textarea"
                placeholder="请输入个人简介（最多200个字符）"
                maxlength="200"
                rows="4"
              />
            </div>
            <div class="form-group">
              <label for="avatarUrl" class="form-label">头像 URL</label>
              <input
                id="avatarUrl"
                v-model="avatarUrl"
                type="url"
                class="form-input"
                placeholder="请输入头像图片链接"
              />
            </div>
            <button type="submit" class="submit-button" :disabled="isLoading">
              {{ isLoading ? '保存中...' : '保存' }}
            </button>
            <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
            <div v-if="error" class="error-message">{{ error }}</div>
          </form>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 个人资料页面
 */

import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';

const router = useRouter();
const userStore = useUserStore();

// 未登录状态
const activeTab = ref<'login' | 'register'>('login');
const loginForm = ref({ email: '', password: '' });
const registerForm = ref({ email: '', username: '', password: '', confirmPassword: '' });
const loginTurnstileToken = ref('');
const registerTurnstileToken = ref('');
const loginTurnstileContainer = ref<HTMLElement | null>(null);
const registerTurnstileContainer = ref<HTMLElement | null>(null);

// 已登录状态
const username = ref('');
const bio = ref('');
const avatarUrl = ref('');

// 通用
const isLoading = ref(false);
const error = ref('');
const successMessage = ref('');

// 监听用户状态变化
watch(() => userStore.user, (newUser) => {
  if (newUser) {
    username.value = newUser.username;
    bio.value = newUser.bio || '';
    avatarUrl.value = newUser.avatarUrl || '';
  }
});

onMounted(() => {
  if (userStore.user) {
    username.value = userStore.user.username;
    bio.value = userStore.user.bio || '';
    avatarUrl.value = userStore.user.avatarUrl || '';
  }
  
  // 加载 Turnstile
  loadTurnstile();
});

onUnmounted(() => {
  // 清理 Turnstile
  if ((window as any).turnstile) {
    if (loginTurnstileContainer.value) {
      (window as any).turnstile.remove(loginTurnstileContainer.value);
    }
    if (registerTurnstileContainer.value) {
      (window as any).turnstile.remove(registerTurnstileContainer.value);
    }
  }
});

async function handleLogin() {
  isLoading.value = true;
  error.value = '';

  const result = await userStore.login(
    loginForm.value.email,
    loginForm.value.password,
    loginTurnstileToken.value
  );

  if (result.success) {
    error.value = '';
    isLoading.value = false;
    // 登录成功后跳转到首页
    router.push('/');
  } else {
    error.value = result.error || '登录失败';
    isLoading.value = false;
  }
}

async function handleRegister() {
  error.value = '';

  // 验证密码
  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    error.value = '两次输入的密码不一致';
    return;
  }

  isLoading.value = true;

  const result = await userStore.register(
    registerForm.value.email,
    registerForm.value.username,
    registerForm.value.password,
    registerTurnstileToken.value
  );

  if (result.success) {
    error.value = '';
    isLoading.value = false;
    // 注册成功后跳转到首页
    router.push('/');
  } else {
    error.value = result.error || '注册失败';
    isLoading.value = false;
  }
}

async function handleSubmit() {
  isLoading.value = true;
  error.value = '';
  successMessage.value = '';

  const result = await userStore.updateProfile(
    username.value || undefined,
    bio.value || undefined,
    avatarUrl.value || undefined
  );

  if (result.success) {
    successMessage.value = result.message || '保存成功';
    setTimeout(() => {
      successMessage.value = '';
    }, 3000);
  } else {
    error.value = result.error || '保存失败';
  }

  isLoading.value = false;
}

function loadTurnstile() {
  const script = document.createElement('script');
  script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);

  script.onload = () => {
    if (loginTurnstileContainer.value && (window as any).turnstile) {
      (window as any).turnstile.render(loginTurnstileContainer.value, {
        sitekey: import.meta.env.VITE_TURNSTILE_SITE_KEY,
        callback: (token: string) => {
          loginTurnstileToken.value = token;
        },
      });
    }
    
    if (registerTurnstileContainer.value && (window as any).turnstile) {
      (window as any).turnstile.render(registerTurnstileContainer.value, {
        sitekey: import.meta.env.VITE_TURNSTILE_SITE_KEY,
        callback: (token: string) => {
          registerTurnstileToken.value = token;
        },
      });
    }
  };
}
</script>

<style scoped>
.profile-page {
  min-height: calc(100vh - 8rem);
  padding: var(--spacing-6);
}

.profile-card {
  max-width: 600px;
  margin: 0 auto;
  padding: var(--spacing-8);
  background-color: var(--color-white);
  border: var(--border-width-medium) solid var(--color-black);
  border-radius: var(--radius-lg);
}

/* 认证标签页 */
.auth-tabs {
  display: flex;
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-6);
  border-bottom: var(--border-width-thin) solid var(--color-gray-200);
}

.auth-tab {
  flex: 1;
  padding: var(--spacing-3) var(--spacing-4);
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-gray-600);
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.auth-tab:hover {
  color: var(--color-black);
}

.auth-tab--active {
  color: var(--color-black);
  border-bottom-color: var(--color-black);
}

/* 认证区域 */
.auth-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
}

.auth-title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  text-align: center;
  margin-bottom: var(--spacing-2);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.switch-auth {
  text-align: center;
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
}

.switch-auth a {
  color: var(--color-black);
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
}

/* 个人资料 */
.profile-title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  margin-bottom: var(--spacing-6);
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  padding-bottom: var(--spacing-6);
  border-bottom: var(--border-width-thin) solid var(--color-gray-200);
}

.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background-color: var(--color-black);
  color: var(--color-white);
  border-radius: 50%;
  font-size: var(--font-size-3xl);
  font-weight: 700;
}

.avatar-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.username {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-black);
}

.email {
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.form-label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-gray-700);
}

.form-input,
.form-textarea {
  padding: var(--spacing-3);
  border: var(--border-width-thin) solid var(--color-gray-300);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  transition: border-color var(--transition-fast);
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--color-black);
}

.form-textarea {
  resize: vertical;
  font-family: inherit;
}

.turnstile-container {
  display: flex;
  justify-content: center;
}

.submit-button {
  padding: var(--spacing-3) var(--spacing-6);
  background-color: var(--color-black);
  color: var(--color-white);
  font-size: var(--font-size-base);
  font-weight: 600;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: opacity var(--transition-fast);
  align-self: flex-start;
}

.submit-button:hover:not(:disabled) {
  opacity: 0.8;
}

.submit-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.success-message {
  padding: var(--spacing-3);
  background-color: var(--color-green-50);
  color: var(--color-green-600);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
}

.error-message {
  padding: var(--spacing-3);
  background-color: var(--color-red-50);
  color: var(--color-red-600);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
}
</style>