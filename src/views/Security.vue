<template>
  <div class="min-h-screen bg-gray-50">
    <NavBar />

    <div class="py-10 transition-all duration-500 ease-in-out">
      <header>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 class="text-3xl font-extrabold leading-tight text-gray-900 tracking-tight animate-[slide-up_0.5s_ease-out]">
            安全设置
          </h1>
        </div>
      </header>
      <main>
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8 mt-8 space-y-8">
          <!-- Password Section -->
          <div class="px-4 sm:px-0 animate-[slide-up_0.5s_ease-out_0.2s_both]">
            <div class="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100">
              <div class="px-6 py-6 border-b border-gray-100 bg-gray-50/50">
                <h3 class="text-xl font-bold text-gray-900">密码修改</h3>
                <p class="mt-1 max-w-2xl text-sm text-gray-500">为了您的账户安全，建议定期更换密码。</p>
              </div>
              <div class="p-6">
                <form @submit.prevent="handleChangePassword" class="space-y-6 max-w-lg">
                  <div>
                    <label for="old-password" class="block text-sm font-medium text-gray-700">当前密码</label>
                    <div class="mt-1">
                      <input 
                        id="old-password" 
                        name="old-password" 
                        type="password" 
                        required 
                        v-model="passwordForm.oldPassword"
                        class="block w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label for="new-password" class="block text-sm font-medium text-gray-700">新密码</label>
                    <div class="mt-1">
                      <input 
                        id="new-password" 
                        name="new-password" 
                        type="password" 
                        required 
                        v-model="passwordForm.newPassword"
                        class="block w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label for="confirm-password" class="block text-sm font-medium text-gray-700">确认新密码</label>
                    <div class="mt-1">
                      <input 
                        id="confirm-password" 
                        name="confirm-password" 
                        type="password" 
                        required 
                        v-model="confirmPassword"
                        class="block w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                      />
                    </div>
                  </div>

                  <div class="flex items-center justify-end">
                    <button 
                      type="submit" 
                      :disabled="passwordLoading"
                      class="w-full flex justify-center py-2 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                    >
                      {{ passwordLoading ? '修改中...' : '修改密码' }}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <!-- Email Section -->
          <div class="px-4 sm:px-0 animate-[slide-up_0.5s_ease-out_0.4s_both]">
            <div class="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100">
              <div class="px-6 py-6 border-b border-gray-100 bg-gray-50/50">
                <h3 class="text-xl font-bold text-gray-900">邮箱管理</h3>
                <p class="mt-1 max-w-2xl text-sm text-gray-500">管理您的绑定邮箱，用于找回密码与安全通知。</p>
              </div>
              <div class="p-6">
                <div class="flex items-center justify-between">
                  <div>
                    <dt class="text-sm font-medium text-gray-500">当前绑定邮箱</dt>
                    <dd class="mt-1 text-lg font-semibold text-gray-900">{{ auth.user?.email }}</dd>
                  </div>
                  <button @click="showEmailModal = true" class="inline-flex items-center px-4 py-2 border border-blue-200 rounded-xl bg-blue-50 text-blue-700 text-sm font-bold hover:bg-blue-100 transition-colors">
                    更换邮箱
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Email Update Modal -->
    <div v-if="showEmailModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <!-- Backdrop Transition -->
        <transition
          enter-active-class="ease-out duration-200"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="ease-in duration-150"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
          appear
        >
          <div class="fixed inset-0 bg-black/20 backdrop-blur-md" aria-hidden="true" @click="showEmailModal = false"></div>
        </transition>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <transition
          enter-active-class="ease-out duration-300"
          enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          enter-to-class="opacity-100 translate-y-0 sm:scale-100"
          leave-active-class="ease-in duration-200"
          leave-from-class="opacity-100 translate-y-0 sm:scale-100"
          leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          appear
        >
          <div class="relative inline-block align-middle bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all w-full sm:my-8 sm:align-middle sm:max-w-xl">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 class="text-xl leading-6 font-bold text-gray-900" id="modal-title">修改绑定邮箱</h3>
              <div class="mt-4 space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">新邮箱地址</label>
                    <div class="flex rounded-xl shadow-sm">
                        <input v-model="newEmailForm.newEmail" type="email" class="flex-1 min-w-0 block w-full px-4 py-2 rounded-l-xl border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm border" placeholder="请输入新邮箱">
                        <button @click="sendCode" :disabled="sending || countdown > 0" class="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 rounded-r-xl bg-gray-50 text-gray-500 text-sm font-medium hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 transition-colors w-32 justify-center">
                            <svg v-if="sending" class="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {{ countdown > 0 ? `${countdown}s` : (sending ? '发送中...' : '获取验证码') }}
                        </button>
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">验证码</label>
                    <input v-model="newEmailForm.verificationCode" type="text" class="block w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="请输入验证码">
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button @click="handleUpdateEmail" :disabled="emailLoading" type="button" class="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 transition-colors">
                {{ emailLoading ? '保存中...' : '保存修改' }}
              </button>
              <button @click="showEmailModal = false" type="button" class="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors">
                取消
              </button>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useToastStore } from '../stores/toast';
import NavBar from '../components/NavBar.vue';
import api from '../api';

const auth = useAuthStore();
const toastStore = useToastStore();

// Password Logic
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
});
const confirmPassword = ref('');
const passwordLoading = ref(false);

const handleChangePassword = async () => {
  if (passwordForm.value.newPassword !== confirmPassword.value) {
    toastStore.error('错误', '两次输入的新密码不一致');
    return;
  }

  if (!auth.user?.username) return;

  passwordLoading.value = true;
  try {
    await api.put(`/users/${auth.user.username}/password`, passwordForm.value);
    toastStore.success('修改成功', '您的密码已成功更新，下次登录请使用新密码。');
    // Clear form
    passwordForm.value.oldPassword = '';
    passwordForm.value.newPassword = '';
    confirmPassword.value = '';
  } catch (e: any) {
    toastStore.error('修改失败', e.message || '旧密码错误或系统异常');
  } finally {
    passwordLoading.value = false;
  }
};

// Email Logic
const showEmailModal = ref(false);
const newEmailForm = ref({ newEmail: '', verificationCode: '' });
const emailLoading = ref(false);
const sending = ref(false);
const countdown = ref(0);

const sendCode = async () => {
    if (!newEmailForm.value.newEmail) {
        toastStore.error('发送失败', '请输入新邮箱地址');
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmailForm.value.newEmail)) {
        toastStore.error('发送失败', '请输入有效的邮箱地址');
        return;
    }

    sending.value = true;
    
    try {
        await api.post('/auth/verification-codes', { email: newEmailForm.value.newEmail, type: 'UPDATE_EMAIL' });
        
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

const handleUpdateEmail = async () => {
    if (!auth.user?.username) return;
    emailLoading.value = true;
    try {
        await api.put(`/users/${auth.user.username}/email`, newEmailForm.value);
        toastStore.success('修改成功', '您的邮箱已成功更新。');
        showEmailModal.value = false;
        await auth.fetchCurrentUser(); // Refresh user data
    } catch (e: any) {
        toastStore.error('修改失败', e.message || '请检查您的验证码是否正确');
    } finally {
        emailLoading.value = false;
    }
};

onMounted(async () => {
  if (!auth.user) {
    await auth.fetchCurrentUser();
  }
});
</script>