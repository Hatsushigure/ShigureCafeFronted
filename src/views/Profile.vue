<template>
  <div class="min-h-screen bg-gray-50">
    <NavBar />

    <div class="py-10 transition-all duration-500 ease-in-out">
      <header>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 class="text-3xl font-extrabold leading-tight text-gray-900 tracking-tight animate-slide-up">
            个人信息
          </h1>
        </div>
      </header>
      <main>
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8 mt-8">
          <div class="px-4 sm:px-0 animate-slide-up animate-delay-50">
            <BaseCard title="基本资料" subtitle="您的个人账户详情与状态。">
              <div class="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-8 pb-8 border-b border-gray-100">
                <div 
                  :class="[avatarColor, 'w-24 h-24 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-md border-4 border-white ring-4 ring-gray-50 flex-shrink-0']"
                >
                  {{ avatarChar }}
                </div>
                <div class="text-center sm:text-left">
                  <h2 class="text-2xl font-bold text-gray-900">{{ auth.user?.nickname || auth.user?.username }}</h2>
                  <p class="text-gray-500">{{ auth.user?.email }}</p>
                  <div class="mt-2 flex flex-wrap justify-center sm:justify-start gap-2">
                    <span class="px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {{ formatRole(auth.user?.role) }}
                    </span>
                    <span :class="[
                      'px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full',
                      auth.user?.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                      auth.user?.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    ]">
                      {{ formatStatus(auth.user?.status) }}
                    </span>
                  </div>
                </div>
              </div>

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
                  <dt class="text-sm font-medium text-gray-500">用户角色</dt>
                  <dd class="mt-1 text-sm text-gray-900">
                    <span class="px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {{ formatRole(auth.user?.role) }}
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
                      {{ formatStatus(auth.user?.status) }}
                    </span>
                  </dd>
                </div>
              </dl>
            </BaseCard>
          </div>

          <!-- Minecraft Section -->
          <div class="px-4 sm:px-0 mt-8 animate-slide-up animate-delay-100">
            <BaseCard title="Minecraft 绑定" subtitle="绑定您的 Minecraft 账号，以便在游戏内享受更多功能。">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div :class="[auth.user?.minecraftUuid ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700', 'px-3 py-1 rounded-full text-xs font-bold transition-colors duration-300']">
                    {{ auth.user?.minecraftUuid ? '已绑定' : '未绑定' }}
                  </div>
                  <div class="flex flex-col" v-if="auth.user?.minecraftUuid">
                    <div class="flex items-center space-x-2">
                        <span class="text-sm font-semibold text-gray-900">{{ auth.user?.minecraftUsername }}</span>
                        <button 
                            @click="handleRefreshMinecraft" 
                            class="p-1 text-gray-400 hover:text-blue-600 transition-colors rounded-full hover:bg-blue-50"
                            title="刷新角色名"
                            :disabled="refreshLoading"
                        >
                            <RotateCw :class="['h-3.5 w-3.5', refreshLoading ? 'animate-spin' : '']" />
                        </button>
                    </div>
                  </div>
                  <span class="text-sm text-gray-600" v-else>绑定后将同步您的游戏属性</span>
                </div>
                <BaseButton 
                  @click="handleBindMinecraft" 
                  :disabled="bindLoading"
                  :variant="auth.user?.minecraftUuid ? 'secondary' : 'primary'"
                  :label="auth.user?.minecraftUuid ? '重新绑定' : '立即绑定'"
                  :loading="bindLoading"
                />
              </div>
            </BaseCard>
          </div>
        </div>
      </main>
    </div>

    <!-- Nickname Update Modal -->
    <Modal :show="showNicknameModal" title="修改昵称" @close="showNicknameModal = false">
      <div class="space-y-4">
        <BaseInput
          v-model="nicknameForm.nickname"
          label="新昵称"
          placeholder="请输入新昵称"
        />
      </div>
      <template #footer>
        <BaseButton
          @click="handleUpdateNickname"
          :loading="nicknameLoading"
          label="保存修改"
          loading-text="保存中..."
        />
        <BaseButton
          variant="outline"
          @click="showNicknameModal = false"
          label="取消"
        />
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useToastStore } from '../stores/toast';
import NavBar from '../components/NavBar.vue';
import BaseCard from '../components/BaseCard.vue';
import BaseInput from '../components/BaseInput.vue';
import BaseButton from '../components/BaseButton.vue';
import Modal from '../components/Modal.vue';
import api from '../api';
import { formatStatus, formatRole } from '../utils/formatters';
import { RotateCw } from 'lucide-vue-next';

const auth = useAuthStore();
const toastStore = useToastStore();
const bindLoading = ref(false);
const refreshLoading = ref(false);

const handleBindMinecraft = async () => {
    bindLoading.value = true;
    try {
        const { clientId } = await api.get<{ clientId: string }>('/users/config/microsoft-client-id');
        const redirectUri = window.location.origin + window.location.pathname;
        const scope = 'XboxLive.signin offline_access';
        // Use 'consumers' endpoint for personal Microsoft accounts
        const authUrl = `https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&response_mode=query&prompt=select_account`;
        window.location.href = authUrl;
    } catch (e: any) {
        toastStore.error('获取配置失败', e.message || '系统异常');
        bindLoading.value = false;
    }
};

const handleRefreshMinecraft = async () => {
    if (!auth.user?.username) return;
    refreshLoading.value = true;
    try {
        await api.post(`/users/${auth.user.username}/minecraft/refresh`);
        toastStore.success('刷新成功', '您的 Minecraft 角色名已更新。');
        await auth.fetchCurrentUser();
    } catch (e: any) {
        toastStore.error('刷新失败', e.message || '系统异常');
    } finally {
        refreshLoading.value = false;
    }
};

const avatarChar = computed(() => {
  const name = auth.user?.nickname || auth.user?.username || '?';
  return name.charAt(0).toUpperCase();
});

const avatarColor = computed(() => {
  const name = auth.user?.nickname || auth.user?.username || '';
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500',
    'bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-teal-500',
    'bg-orange-500', 'bg-cyan-500'
  ];
  return colors[Math.abs(hash) % colors.length];
});

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

  // Handle OAuth2 callback
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  if (code && auth.user) {
    // Clear code from URL
    window.history.replaceState({}, document.title, window.location.pathname);
    
    bindLoading.value = true;
    try {
        const redirectUri = window.location.origin + window.location.pathname;
        await api.post(`/users/${auth.user.username}/minecraft/bind`, { code, redirectUri });
        toastStore.success('绑定成功', '您的 Minecraft 账号已成功绑定。');
        // Force refresh user data
        auth.user = null;
        await auth.fetchCurrentUser();
    } catch (e: any) {
        toastStore.error('绑定失败', e.message || '可能原因：Microsoft 账号未购买 Minecraft 或授权超时');
    } finally {
        bindLoading.value = false;
    }
  }
});
</script>