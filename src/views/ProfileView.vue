<template>
  <div class="profile-page">
    <div class="container">
      <div class="profile-card">
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 个人资料页面
 */

import { ref, onMounted } from 'vue';
import { useUserStore } from '@/stores/userStore';

const userStore = useUserStore();

const username = ref('');
const bio = ref('');
const avatarUrl = ref('');
const isLoading = ref(false);
const error = ref('');
const successMessage = ref('');

onMounted(() => {
  if (userStore.user) {
    username.value = userStore.user.username;
    bio.value = userStore.user.bio || '';
    avatarUrl.value = userStore.user.avatarUrl || '';
  }
});

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