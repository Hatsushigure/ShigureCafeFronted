<template>
  <div class="min-h-screen bg-gray-100">
    <NavBar />

    <div class="py-10">
      <header>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 class="text-3xl font-bold leading-tight text-gray-900">
            个人信息
          </h1>
        </div>
      </header>
      <main>
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div class="px-4 py-8 sm:px-0">
            <div class="bg-white shadow overflow-hidden sm:rounded-lg">
              <div class="px-4 py-5 sm:px-6">
                <h3 class="text-lg leading-6 font-medium text-gray-900">用户信息</h3>
                <p class="mt-1 max-w-2xl text-sm text-gray-500">您的个人账户详情。</p>
              </div>
              <div class="border-t border-gray-200">
                <dl>
                  <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt class="text-sm font-medium text-gray-500">用户名</dt>
                    <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ auth.user?.username }}</dd>
                  </div>
                  <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt class="text-sm font-medium text-gray-500">电子邮箱</dt>
                    <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex justify-between items-center">
                      <span>{{ auth.user?.email }}</span>
                      <button @click="showEmailModal = true" class="text-blue-600 hover:text-blue-500 text-sm font-medium">修改</button>
                    </dd>
                  </div>

                  <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt class="text-sm font-medium text-gray-500">角色权限</dt>
                    <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {{ auth.user?.role }}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Email Update Modal -->
    <div v-if="showEmailModal" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <!-- Overlay removed -->

        <div class="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full border border-gray-200">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">修改绑定邮箱</h3>
            <div class="mt-4 space-y-4">
              <div>
                  <label class="block text-sm font-medium text-gray-700">新邮箱地址</label>
                  <div class="mt-1 flex rounded-md shadow-sm">
                      <input v-model="newEmailForm.newEmail" type="email" class="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300" placeholder="请输入新邮箱">
                      <button @click="sendCode" :disabled="sending || countdown > 0" class="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm hover:bg-gray-100 disabled:opacity-50">
                          {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
                      </button>
                  </div>
              </div>
              <div>
                  <label class="block text-sm font-medium text-gray-700">验证码</label>
                  <input v-model="newEmailForm.verificationCode" type="text" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="请输入验证码">
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button @click="handleUpdateEmail" :disabled="loading" type="button" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
              {{ loading ? '保存中...' : '保存' }}
            </button>
            <button @click="showEmailModal = false" type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
              取消
            </button>
          </div>
        </div>
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

// Email Update Logic
const showEmailModal = ref(false);
const newEmailForm = ref({ newEmail: '', verificationCode: '' });
const loading = ref(false);
const sending = ref(false);
const countdown = ref(0);

const sendCode = async () => {
    if (!newEmailForm.value.newEmail) {
        toastStore.error('发送失败', '请输入新邮箱地址');
        return;
    }
    sending.value = true;
    
    // Optimistic UI: Show success message immediately
    toastStore.success('发送成功', '验证码已发送至您的新邮箱，请注意查收。');
    countdown.value = 60;
    const timer = setInterval(() => {
        countdown.value--;
        if (countdown.value <= 0) {
            clearInterval(timer);
            sending.value = false; // Re-enable button after countdown
        }
    }, 1000);

    try {
        await api.post('/auth/verification-codes', { email: newEmailForm.value.newEmail, type: 'UPDATE_EMAIL' });
        // No success message here as we've already shown it.
    } catch (e: any) {
        // Show error only on failure
        toastStore.error('发送失败', e.response?.data?.message || '请求失败，请稍后重试');
        countdown.value = 0; // Reset countdown on error
    } 
    // `sending` is managed by the timer now
};

const handleUpdateEmail = async () => {
    if (!auth.user?.username) return;
    loading.value = true;
    try {
        await api.put(`/users/${auth.user.username}/email`, newEmailForm.value);
        toastStore.success('修改成功', '您的邮箱已成功更新。');
        showEmailModal.value = false;
        await auth.fetchCurrentUser(); // Refresh user data
    } catch (e: any) {
        toastStore.error('修改失败', e.response?.data?.message || '请检查您的验证码是否正确');
    } finally {
        loading.value = false;
    }
};

onMounted(async () => {
  if (!auth.user) {
    await auth.fetchCurrentUser();
  }
});
</script>
