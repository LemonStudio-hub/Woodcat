<template>
  <div class="register-page">
    <div class="container">
      <div class="register-card">
        <h1 class="register-title">注册</h1>
        <form @submit.prevent="handleSubmit" class="register-form">
          <div class="form-group">
            <label for="email" class="form-label">邮箱</label>
            <input
              id="email"
              v-model="email"
              type="email"
              class="form-input"
              placeholder="请输入邮箱"
              required
            />
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
              required
            />
          </div>
          <div class="form-group">
            <label for="password" class="form-label">密码</label>
            <input
              id="password"
              v-model="password"
              type="password"
              class="form-input"
              placeholder="请输入密码（至少6个字符）"
              minlength="6"
              required
            />
          </div>
          <div class="form-group">
            <label for="confirmPassword" class="form-label">确认密码</label>
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              class="form-input"
              placeholder="请再次输入密码"
              required
            />
          </div>
          <div class="form-group">
            <div ref="turnstileContainer" class="turnstile-container"></div>
          </div>
          <button type="submit" class="submit-button" :disabled="isLoading || !turnstileToken">
            {{ isLoading ? '注册中...' : '注册' }}
          </button>
          <div v-if="error" class="error-message">{{ error }}</div>
        </form>
        <div class="register-footer">
          <span>已有账号？</span>
          <router-link to="/login" class="link">立即登录</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 注册页面
 */

import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';

const router = useRouter();
const userStore = useUserStore();

const email = ref('');
const username = ref('');
const password = ref('');
const confirmPassword = ref('');
const turnstileToken = ref('');
const isLoading = ref(false);
const error = ref('');

const turnstileContainer = ref<HTMLElement | null>(null);

onMounted(() => {
  loadTurnstile();
});

async function handleSubmit() {
  error.value = '';

  // 验证密码
  if (password.value !== confirmPassword.value) {
    error.value = '两次输入的密码不一致';
    return;
  }

  isLoading.value = true;

  const result = await userStore.register(email.value, username.value, password.value, turnstileToken.value);

  if (result.success) {
    router.push('/');
  } else {
    error.value = result.error || '注册失败';
    isLoading.value = false;
  }
}

function loadTurnstile() {
  const script = document.createElement('script');
  script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);

  script.onload = () => {
    if (turnstileContainer.value && (window as any).turnstile) {
      (window as any).turnstile.render(turnstileContainer.value, {
        sitekey: (import.meta as any).env.VITE_TURNSTILE_SITE_KEY,
        callback: (token: string) => {
          turnstileToken.value = token;
        },
      });
    }
  };
}
</script>

<style scoped>
.register-page {
  min-height: calc(100vh - 8rem);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-6);
}

.register-card {
  width: 100%;
  max-width: 400px;
  padding: var(--spacing-8);
  background-color: var(--color-white);
  border: var(--border-width-medium) solid var(--color-black);
  border-radius: var(--radius-lg);
}

.register-title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  text-align: center;
  margin-bottom: var(--spacing-6);
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
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

.form-input {
  padding: var(--spacing-3);
  border: var(--border-width-thin) solid var(--color-gray-300);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  transition: border-color var(--transition-fast);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-black);
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
}

.submit-button:hover:not(:disabled) {
  opacity: 0.8;
}

.submit-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-message {
  padding: var(--spacing-3);
  background-color: var(--color-red-50);
  color: var(--color-red-600);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
}

.register-footer {
  margin-top: var(--spacing-6);
  text-align: center;
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
}

.link {
  color: var(--color-black);
  font-weight: 600;
  text-decoration: underline;
}
</style>