<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 sm:px-6 lg:px-8 transition-colors duration-500">
    <div class="max-w-md w-full space-y-8 p-10 bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 transform transition-all duration-500 hover:shadow-3xl">
      <div class="text-center">
        <h2 class="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">欢迎回来</h2>
        <p class="mt-2 text-sm text-gray-600">请登录您的账号</p>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="space-y-4">
          <div class="group">
            <label for="username" class="block text-sm font-medium text-gray-700 mb-1 ml-1">用户名</label>
            <input v-model="form.username" id="username" type="text" required class="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:z-10 sm:text-sm transition-all duration-200 ease-in-out bg-white/50 focus:bg-white" placeholder="请输入用户名" />
          </div>
          <div class="group">
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1 ml-1">密码</label>
            <input v-model="form.password" id="password" type="password" required class="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:z-10 sm:text-sm transition-all duration-200 ease-in-out bg-white/50 focus:bg-white" placeholder="请输入密码" />
          </div>
        </div>

        <div>
          <button :disabled="loading" type="submit" class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 ease-out">
            <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ loading ? '登录中...' : '立即登录' }}
          </button>
        </div>
      </form>
      <div class="flex items-center justify-between text-sm mt-4">
        <router-link to="/register" class="font-medium text-blue-600 hover:text-indigo-500 transition-colors">
          还没有账号？立即注册
        </router-link>
        <router-link to="/forgot-password" class="font-medium text-gray-500 hover:text-gray-700 transition-colors">
          忘记密码？
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import { useToastStore } from '../stores/toast';

const form = ref({ username: '', password: '' });
const loading = ref(false);
const auth = useAuthStore();
const router = useRouter();
const toastStore = useToastStore();

const handleLogin = async () => {
  loading.value = true;
  try {
    await auth.login(form.value);
    router.push('/dashboard');
  } catch (e: any) {
    toastStore.error('登录失败', e.message || '请检查您的用户名和密码');
  } finally {
    loading.value = false;
  }
};
</script>

