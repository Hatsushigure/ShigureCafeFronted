<template>
  <div class="min-h-screen bg-gray-50">
    <NavBar />

    <div class="py-10 transition-all duration-500 ease-in-out">
      <header>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 class="text-3xl font-extrabold leading-tight text-gray-900 tracking-tight animate-[slide-up_0.5s_ease-out]">
            个人信息
          </h1>
        </div>
      </header>
      <main>
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8 mt-8">
          <div class="px-4 sm:px-0 animate-[slide-up_0.5s_ease-out_0.2s_both]">
            <div class="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100">
              <div class="px-6 py-6 border-b border-gray-100 bg-gray-50/50">
                <h3 class="text-xl font-bold text-gray-900">基本资料</h3>
                <p class="mt-1 max-w-2xl text-sm text-gray-500">您的个人账户详情与状态。</p>
              </div>
              <div class="p-6">
                <dl class="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                  <div class="sm:col-span-1">
                    <dt class="text-sm font-medium text-gray-500">用户名</dt>
                    <dd class="mt-1 text-sm font-semibold text-gray-900">{{ auth.user?.username }}</dd>
                  </div>

                  <div class="sm:col-span-1">
                    <dt class="text-sm font-medium text-gray-500">昵称</dt>
                    <dd class="mt-1 text-sm text-gray-900 flex items-center space-x-2">
                      <span class="font-medium text-gray-900">{{ auth.user?.nickname || '未设置' }}</span>
                      <button @click="openNicknameModal" class="text-blue-600 hover:text-blue-700 text-xs font-bold border border-blue-200 rounded px-2 py-0.5 hover:bg-blue-50 transition-colors">修改</button>
                    </dd>
                  </div>

                  <div class="sm:col-span-1">
                    <dt class="text-sm font-medium text-gray-500">角色权限</dt>
                    <dd class="mt-1 text-sm text-gray-900">
                      <span class="px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {{ auth.user?.role }}
                      </span>
                    </dd>
                  </div>

                  <div class="sm:col-span-1">
                    <dt class="text-sm font-medium text-gray-500">电子邮箱</dt>
                    <dd class="mt-1 text-sm text-gray-900">
                      <span class="font-medium">{{ auth.user?.email }}</span>
                    </dd>
                  </div>

                  <div class="sm:col-span-1">
                    <dt class="text-sm font-medium text-gray-500">账户状态</dt>
                    <dd class="mt-1 text-sm text-gray-900">
                      <span :class="[
                        'px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full',
                        auth.user?.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                        auth.user?.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      ]">
                        {{ auth.user?.status === 'ACTIVE' ? '正常' : 
                           auth.user?.status === 'PENDING' ? '待审核' : 
                           auth.user?.status === 'BANNED' ? '封禁' : auth.user?.status }}
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

    <!-- Nickname Update Modal -->
    <div v-if="showNicknameModal" class="fixed inset-0 z-50 overflow-y-auto">
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
          <div class="fixed inset-0 bg-black/20 backdrop-blur-md" aria-hidden="true" @click="showNicknameModal = false"></div>
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
              <h3 class="text-xl leading-6 font-bold text-gray-900" id="modal-title">修改昵称</h3>
              <div class="mt-4 space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">新昵称</label>
                    <input v-model="nicknameForm.nickname" type="text" class="block w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="请输入新昵称">
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button @click="handleUpdateNickname" :disabled="nicknameLoading" type="button" class="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 transition-colors">
                {{ nicknameLoading ? '保存中...' : '保存修改' }}
              </button>
              <button @click="showNicknameModal = false" type="button" class="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors">
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

// Nickname Update Logic
const showNicknameModal = ref(false);
const nicknameForm = ref({ nickname: '' });
const nicknameLoading = ref(false);

const openNicknameModal = () => {
    nicknameForm.value.nickname = auth.user?.nickname || '';
    showNicknameModal.value = true;
};

const handleUpdateNickname = async () => {
    if (!auth.user?.username) return;
    nicknameLoading.value = true;
    try {
        await api.put(`/users/${auth.user.username}/nickname`, nicknameForm.value);
        toastStore.success('修改成功', '您的昵称已成功更新。');
        showNicknameModal.value = false;
        await auth.fetchCurrentUser();
    } catch (e: any) {
        toastStore.error('修改失败', e.message || '系统繁忙，请稍后再试');
    } finally {
        nicknameLoading.value = false;
    }
};

onMounted(async () => {
  if (!auth.user) {
    await auth.fetchCurrentUser();
  }
});
</script>
