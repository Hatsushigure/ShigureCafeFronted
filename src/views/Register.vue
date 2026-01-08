<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 sm:px-6 lg:px-8 transition-colors duration-500">
    <div class="max-w-md w-full space-y-8 p-10 bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 transform transition-all duration-500 hover:shadow-3xl">
      
      <!-- Success View -->
      <div v-if="registrationSuccess" class="text-center space-y-6 animate-[scale_0.5s_ease-out]">
        <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 animate-[float_3s_ease-in-out_infinite]">
          <svg class="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 class="text-3xl font-extrabold text-gray-900 tracking-tight">申请提交成功</h2>
        <div class="text-left bg-white/60 p-6 rounded-xl border border-blue-100 shadow-sm">
          <p class="text-sm font-medium text-gray-700 mb-3">您的账号需要审核。请保存审核码：</p>
          <div class="flex items-center justify-between bg-blue-50/50 p-4 rounded-lg border border-blue-200 group hover:border-blue-300 transition-colors cursor-text">
            <code class="text-xl font-mono font-bold text-blue-700 select-all tracking-wider">{{ auditCode }}</code>
            <span class="text-xs text-blue-400 group-hover:text-blue-500">可复制</span>
          </div>
          <p class="text-xs text-gray-500 mt-3 leading-relaxed">
            请将此代码发送给管理员以激活您的账号。未审核的账号无法登录。
          </p>
        </div>
        <router-link to="/login" class="block w-full py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">
          返回登录页面
        </router-link>
      </div>

      <!-- Registration Form -->
      <div v-else class="animate-[fade_0.5s_ease-out]">
        <div class="text-center">
          <h2 class="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">创建新账号</h2>
          <p class="mt-2 text-sm text-gray-600">加入 猫咖，开启您的旅程</p>
        </div>
        <form class="mt-8 space-y-5" @submit.prevent="handleRegister">
          <div class="space-y-4">
             <div class="group">
               <label for="username" class="block text-sm font-medium text-gray-700 mb-1 ml-1">用户名</label>
               <input v-model="form.username" id="username" name="username" autocomplete="username" type="text" required class="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:z-10 sm:text-sm transition-all duration-200 ease-in-out bg-white/50 focus:bg-white" placeholder="3-50位字符，包含字母数字" />
             </div>

             <div class="group">
               <label for="nickname" class="block text-sm font-medium text-gray-700 mb-1 ml-1">昵称</label>
               <input v-model="form.nickname" id="nickname" name="nickname" type="text" class="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:z-10 sm:text-sm transition-all duration-200 ease-in-out bg-white/50 focus:bg-white" placeholder="您的显示名称 (选填)" />
             </div>
            
            <div class="group">
               <label for="email" class="block text-sm font-medium text-gray-700 mb-1 ml-1">电子邮箱</label>
               <div class="flex space-x-2">
                  <input v-model.trim="form.email" id="email" name="email" autocomplete="email" type="email" required class="appearance-none rounded-xl block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 sm:text-sm transition-all duration-200 bg-white/50 focus:bg-white" placeholder="your@email.com" />
                  <button @click="sendCode" type="button" :disabled="sending || countdown > 0" class="whitespace-nowrap px-4 py-3 text-sm font-bold text-blue-600 border border-blue-200 bg-blue-50/50 rounded-xl hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 w-32 shadow-sm flex items-center justify-center">
                    <svg v-if="sending" class="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {{ countdown > 0 ? `${countdown}s` : (sending ? '发送中...' : '获取验证码') }}
                  </button>
               </div>
            </div>

            <div class="group">
               <label for="verificationCode" class="block text-sm font-medium text-gray-700 mb-1 ml-1">验证码</label>
               <input v-model="form.verificationCode" id="verificationCode" name="verificationCode" autocomplete="one-time-code" type="text" required class="appearance-none rounded-xl block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 sm:text-sm transition-all duration-200 bg-white/50 focus:bg-white" placeholder="请输入邮箱验证码" />
            </div>

            <div class="group">
               <label for="password" class="block text-sm font-medium text-gray-700 mb-1 ml-1">密码</label>
               <input v-model="form.password" id="password" name="password" autocomplete="new-password" type="password" required class="appearance-none rounded-xl block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 sm:text-sm transition-all duration-200 bg-white/50 focus:bg-white" placeholder="设置您的登录密码" />
            </div>

            <div class="group">
               <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1 ml-1">确认密码</label>
               <input v-model="form.confirmPassword" id="confirmPassword" name="confirmPassword" autocomplete="new-password" type="password" required class="appearance-none rounded-xl block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 sm:text-sm transition-all duration-200 bg-white/50 focus:bg-white" placeholder="请再次输入密码" />
            </div>
          </div>

          <button :disabled="loading" type="submit" class="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 ease-out mt-6">
            <span v-if="loading" class="mr-2">
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ loading ? '正在提交注册...' : '立即注册' }}
          </button>
        </form>
        <div class="text-center text-sm mt-6">
          <router-link to="/login" class="font-medium text-blue-600 hover:text-indigo-500 transition-colors">
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
  nickname: '',
  email: '',
  password: '',
  confirmPassword: '',
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
    toastStore.error('发送失败', e.message || '请求失败，请稍后重试');
    sending.value = false;
  }
};

const handleRegister = async () => {
  const usernameRegex = /^[a-zA-Z0-9-_]{3,50}$/;
  if (!usernameRegex.test(form.username)) {
    toastStore.error('注册失败', '用户名必须为3-50位，且只能包含字母、数字、连字符和下划线');
    return;
  }

  if (form.password !== form.confirmPassword) {
    toastStore.error('注册失败', '两次输入的密码不一致');
    return;
  }

  loading.value = true;
  try {
    const { confirmPassword, ...registerData } = form;
    const response: any = await api.post('/registrations', registerData);
    auditCode.value = response.auditCode;
    registrationSuccess.value = true;
    toastStore.success('注册申请已提交', '请保存您的审核码');
  } catch (e: any) {
    toastStore.error('注册失败', e.message || '请检查您填写的信息');
  } finally {
    loading.value = false;
  }
};
</script>
