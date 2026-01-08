<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg border border-gray-100">
      
      <!-- Success View -->
      <div v-if="registrationSuccess" class="text-center space-y-6">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
          <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 class="text-3xl font-extrabold text-gray-900">注册申请已提交</h2>
        <div class="text-left bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p class="text-sm text-gray-600 mb-2">请保存您的审核码：</p>
          <div class="flex items-center justify-between bg-white p-3 rounded border border-gray-300">
            <code class="text-lg font-mono font-bold text-blue-600 select-all">{{ auditCode }}</code>
          </div>
          <p class="text-xs text-gray-500 mt-2">
            您需要将此代码提供给管理员以激活您的账号。
          </p>
        </div>
        <router-link to="/login" class="block w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
          返回登录
        </router-link>
      </div>

      <!-- Registration Form -->
      <div v-else>
        <div class="text-center">
          <h2 class="text-3xl font-extrabold text-gray-900">注册账号</h2>
          <p class="mt-2 text-sm text-gray-600">创建一个新账号以开始使用</p>
        </div>
        <form class="mt-8 space-y-4" @submit.prevent="handleRegister">
          <div class="space-y-4">
            <input v-model="form.username" name="username" autocomplete="username" type="text" required class="appearance-none rounded-lg block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="用户名" />
            
            <div class="flex space-x-2">
              <input v-model.trim="form.email" name="email" autocomplete="email" type="email" required class="appearance-none rounded-lg block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="电子邮箱" />
              <button @click="sendCode" type="button" :disabled="sending || countdown > 0" class="whitespace-nowrap px-3 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50">
                {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
              </button>
            </div>

            <input v-model="form.verificationCode" name="verificationCode" autocomplete="one-time-code" type="text" required class="appearance-none rounded-lg block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="验证码" />
            <input v-model="form.password" name="password" autocomplete="new-password" type="password" required class="appearance-none rounded-lg block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="密码" />
          </div>

          <button :disabled="loading" type="submit" class="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors">
            {{ loading ? '注册中...' : '注册' }}
          </button>
        </form>
        <div class="text-center text-sm">
          <router-link to="/login" class="font-medium text-blue-600 hover:text-blue-500 transition-colors">
            已有账号？返回登录
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import api from '../api';
import { useToastStore } from '../stores/toast';

const toastStore = useToastStore();
const form = reactive({
  username: '',
  email: '',
  password: '',
  verificationCode: ''
});

const loading = ref(false);
const sending = ref(false);
const countdown = ref(0);
const registrationSuccess = ref(false);
const auditCode = ref('');

const sendCode = async () => {
  if (!form.email) {
    toastStore.error('发送失败', '请输入您的邮箱地址');
    return;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(form.email)) {
    toastStore.error('发送失败', '请输入有效的邮箱地址');
    return;
  }
  
  // Optimistic UI
  sending.value = true;

  try {
    await api.post('/auth/verification-codes', { email: form.email, type: 'REGISTER' });
    
    toastStore.success('发送成功', '验证码已发送至您的邮箱，请注意查收。');
    countdown.value = 60;
    const timer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        clearInterval(timer);
        sending.value = false;
      }
    }, 1000);
  } catch (e: any) {
    toastStore.error('发送失败', e.response?.data?.message || '请求失败，请稍后重试');
    sending.value = false;
  }
};

const handleRegister = async () => {
  const usernameRegex = /^[a-zA-Z0-9-_]{3,50}$/;
  if (!usernameRegex.test(form.username)) {
    toastStore.error('注册失败', '用户名必须为3-50位，且只能包含字母、数字、连字符和下划线');
    return;
  }

  loading.value = true;
  try {
    const response = await api.post('/registrations', form);
    auditCode.value = response.data.auditCode;
    registrationSuccess.value = true;
    toastStore.success('注册申请已提交', '请保存您的审核码');
  } catch (e: any) {
    toastStore.error('注册失败', e.response?.data?.message || '请检查您填写的信息');
  } finally {
    loading.value = false;
  }
};
</script>
