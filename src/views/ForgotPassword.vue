<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 sm:px-6 lg:px-8 transition-colors duration-500">
    <div class="max-w-md w-full space-y-8 p-10 bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 transform transition-all duration-500 hover:shadow-3xl animate-[fade_0.5s_ease-out]">
      <div class="text-center">
        <h2 class="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">重置密码</h2>
        <p class="mt-2 text-sm text-gray-600">请输入您的邮箱以获取验证码</p>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleReset">
        <div class="space-y-4">
          <!-- 邮箱输入和发送验证码 -->
          <div class="group">
             <label for="email" class="block text-sm font-medium text-gray-700 mb-1 ml-1">电子邮箱</label>
             <div class="flex space-x-2">
                <input v-model="form.email" id="email" type="email" required class="appearance-none rounded-xl block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 sm:text-sm transition-all duration-200 bg-white/50 focus:bg-white" placeholder="your@email.com" />
                <button @click="sendCode" type="button" :disabled="sending || countdown > 0" class="whitespace-nowrap px-4 py-3 text-sm font-bold text-blue-600 border border-blue-200 bg-blue-50/50 rounded-xl hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 w-32 shadow-sm flex items-center justify-center">
                  <svg v-if="sending" class="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ countdown > 0 ? `${countdown}s` : (sending ? '发送中...' : '获取验证码') }}
                </button>
             </div>
          </div>

          <!-- 验证码 -->
          <div class="group">
            <label for="code" class="block text-sm font-medium text-gray-700 mb-1 ml-1">验证码</label>
            <input v-model="form.verificationCode" id="code" type="text" autocomplete="one-time-code" required class="appearance-none rounded-xl block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 sm:text-sm transition-all duration-200 bg-white/50 focus:bg-white" placeholder="请输入验证码" />
          </div>
          
          <!-- 新密码 -->
          <div class="group">
            <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-1 ml-1">新密码</label>
            <input v-model="form.newPassword" id="newPassword" type="password" required class="appearance-none rounded-xl block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 sm:text-sm transition-all duration-200 bg-white/50 focus:bg-white" placeholder="设置新密码" />
          </div>

          <!-- 确认密码 -->
          <div class="group">
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1 ml-1">确认密码</label>
            <input v-model="form.confirmPassword" id="confirmPassword" type="password" required class="appearance-none rounded-xl block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 sm:text-sm transition-all duration-200 bg-white/50 focus:bg-white" placeholder="请再次输入新密码" />
          </div>
        </div>

        <button :disabled="loading" type="submit" class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 ease-out">
          <span v-if="loading" class="mr-2">
            <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </span>
          {{ loading ? '正在重置...' : '重置密码' }}
        </button>
      </form>
      <div class="text-center text-sm mt-4">
        <router-link to="/login" class="font-medium text-blue-600 hover:text-indigo-500 transition-colors">
          记起密码了？返回登录
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import api from '../api';
import { useRouter } from 'vue-router';
import { useToastStore } from '../stores/toast';

const router = useRouter();
const toastStore = useToastStore();
const form = ref({
  email: '',
  verificationCode: '',
  newPassword: '',
  confirmPassword: ''
});

const loading = ref(false);
const sending = ref(false);
const countdown = ref(0);

const sendCode = async () => {
  if (!form.value.email) {
    toastStore.error('发送失败', '请输入您的邮箱地址');
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(form.value.email)) {
    toastStore.error('发送失败', '请输入有效的邮箱地址');
    return;
  }

  // Optimistic UI
  sending.value = true;

  try {
    await api.post('/auth/verification-codes', { email: form.value.email, type: 'RESET_PASSWORD' });

    sending.value = false;
    toastStore.success('发送成功', '验证码已发送至您的邮箱，请注意查收。');
    countdown.value = 60;
    const timer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        clearInterval(timer);
      }
    }, 1000);
  } catch (e: any) {
    toastStore.error('发送失败', e.response?.data?.message || '请求失败，请稍后重试');
    sending.value = false;
  }
};

const handleReset = async () => {
  if (form.value.newPassword !== form.value.confirmPassword) {
    toastStore.error('重置失败', '两次输入的密码不一致');
    return;
  }

  loading.value = true;
  try {
    const { confirmPassword, ...resetData } = form.value;
    await api.post('/auth/password-reset', resetData);
    toastStore.success('操作成功', '密码已重置，请使用新密码登录。');
    router.push('/login');
  } catch (e: any) {
    toastStore.error('重置失败', e.response?.data?.message || '请检查验证码是否正确');
  } finally {
    loading.value = false;
  }
};
</script>

