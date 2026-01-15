<template>
  <div class="min-h-screen bg-gray-50">
    <NavBar />

    <div class="py-10 transition-all duration-500 ease-in-out">
      <header>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 class="text-3xl font-extrabold leading-tight text-gray-900 tracking-tight animate-slide-up">
            {{ t('profile.title') }}
          </h1>
        </div>
      </header>
      <main>
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8 mt-8">
          <div class="px-4 sm:px-0 animate-slide-up animate-delay-50">
            <BaseCard :title="t('profile.basic-info.title')" :subtitle="t('profile.basic-info.subtitle')">
              <div
                class="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-8 pb-8 border-b border-gray-100">
                <UserAvatar :name="auth.user?.nickname || auth.user?.username" size="2xl" />
                <div class="text-center sm:text-left">
                  <h2 class="text-2xl font-bold text-gray-900">{{ auth.user?.nickname || auth.user?.username }}</h2>
                  <p class="text-gray-500">{{ auth.user?.email }}</p>
                  <div class="mt-2 flex flex-wrap justify-center sm:justify-start gap-2">
                    <RoleBadge v-if="auth.user?.role" :role="auth.user.role" />
                    <StatusBadge v-if="auth.user?.status" :status="auth.user.status" />
                  </div>
                </div>
              </div>

              <dl class="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                <div class="sm:col-span-1">
                  <dt class="text-sm font-medium text-gray-500">{{ t('profile.basic-info.username') }}</dt>
                  <dd class="mt-1 text-sm font-semibold text-gray-900">{{ auth.user?.username }}</dd>
                </div>

                <div class="sm:col-span-1">
                  <dt class="text-sm font-medium text-gray-500">{{ t('profile.basic-info.nickname') }}</dt>
                  <dd class="mt-1 text-sm text-gray-900 flex items-center space-x-2">
                    <span class="font-medium text-gray-900">{{ auth.user?.nickname || t('profile.basic-info.not-set')
                      }}</span>
                    <button @click="openNicknameModal"
                      class="text-blue-600 hover:text-blue-700 text-xs font-bold border border-blue-200 rounded px-2 py-0.5 hover:bg-blue-50 transition-colors">{{
                        t('profile.basic-info.modify') }}</button>
                  </dd>
                </div>

                <div class="sm:col-span-1">
                  <dt class="text-sm font-medium text-gray-500">{{ t('profile.basic-info.role') }}</dt>
                  <dd class="mt-1 text-sm text-gray-900">
                    <RoleBadge v-if="auth.user?.role" :role="auth.user.role" />
                  </dd>
                </div>

                <div class="sm:col-span-1">
                  <dt class="text-sm font-medium text-gray-500">{{ t('profile.basic-info.email') }}</dt>
                  <dd class="mt-1 text-sm text-gray-900">
                    <span class="font-medium">{{ auth.user?.email }}</span>
                  </dd>
                </div>

                <div class="sm:col-span-1">
                  <dt class="text-sm font-medium text-gray-500">{{ t('profile.basic-info.status') }}</dt>
                  <dd class="mt-1 text-sm text-gray-900">
                    <StatusBadge v-if="auth.user?.status" :status="auth.user.status" />
                  </dd>
                </div>
              </dl>
            </BaseCard>
          </div>

          <!-- Minecraft Section -->
          <div class="px-4 sm:px-0 mt-8 animate-slide-up animate-delay-100">
            <BaseCard :title="t('profile.minecraft.title')" :subtitle="t('profile.minecraft.subtitle')">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div
                    :class="[auth.user?.minecraftUuid ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700', 'px-3 py-1 rounded-full text-xs font-bold transition-colors duration-300']">
                    {{ auth.user?.minecraftUuid ? t('profile.minecraft.bound') : t('profile.minecraft.not-bound') }}
                  </div>
                  <div class="flex flex-col" v-if="auth.user?.minecraftUuid">
                    <div class="flex items-center space-x-2">
                      <span class="text-sm font-semibold text-gray-900">{{ auth.user?.minecraftUsername }}</span>
                      <button @click="handleRefreshMinecraft"
                        class="p-1 text-gray-400 hover:text-blue-600 transition-colors rounded-full hover:bg-blue-50"
                        :title="t('profile.minecraft.refresh-title')" :disabled="refreshLoading">
                        <RotateCw :class="['h-3.5 w-3.5', refreshLoading ? 'animate-spin' : '']" />
                      </button>
                    </div>
                  </div>
                  <span class="text-sm text-gray-600" v-else>{{ t('profile.minecraft.sync-info') }}</span>
                </div>
                <BaseButton @click="handleBindMinecraft" :disabled="bindLoading"
                  :variant="auth.user?.minecraftUuid ? 'secondary' : 'primary'"
                  :label="auth.user?.minecraftUuid ? t('profile.minecraft.rebind') : t('profile.minecraft.bind-now')"
                  :loading="bindLoading" />
              </div>
            </BaseCard>
          </div>
        </div>
      </main>
    </div>

    <!-- Nickname Update Modal -->
    <Modal :show="showNicknameModal" :title="t('profile.nickname-modal.title')" @close="showNicknameModal = false">
      <div class="space-y-4">
        <BaseInput v-model="nicknameForm.nickname" :label="t('profile.nickname-modal.label')"
          :placeholder="t('profile.nickname-modal.placeholder')" />
      </div>
      <template #footer>
        <BaseButton @click="handleUpdateNickname" :loading="nicknameLoading" :label="t('profile.nickname-modal.save')"
          :loading-text="t('profile.nickname-modal.saving')" />
        <BaseButton variant="outline" @click="showNicknameModal = false" :label="t('common.cancel')" />
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '../stores/auth';
import { useToastStore } from '../stores/toast';
import NavBar from '../components/NavBar.vue';
import BaseCard from '../components/BaseCard.vue';
import BaseInput from '../components/BaseInput.vue';
import BaseButton from '../components/BaseButton.vue';
import Modal from '../components/Modal.vue';
import UserAvatar from '../components/UserAvatar.vue';
import RoleBadge from '../components/RoleBadge.vue';
import StatusBadge from '../components/StatusBadge.vue';
import api from '../api';
import { RotateCw } from 'lucide-vue-next';

const { t } = useI18n();
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
    toastStore.error(t('profile.messages.get-config-failed'), e.message || t('profile.messages.system-error'));
    bindLoading.value = false;
  }
};

const handleRefreshMinecraft = async () => {
  if (!auth.user?.username) return;
  refreshLoading.value = true;
  try {
    await api.post(`/users/${auth.user.username}/minecraft/refresh`);
    toastStore.success(t('profile.messages.refresh-success'), t('profile.messages.refresh-success-detail'));
    await auth.fetchCurrentUser();
  } catch (e: any) {
    toastStore.error(t('profile.messages.refresh-failed'), e.message || t('profile.messages.system-error'));
  } finally {
    refreshLoading.value = false;
  }
};

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
    toastStore.success(t('profile.messages.update-nickname-success'), t('profile.messages.update-nickname-detail'));
    showNicknameModal.value = false;
    await auth.fetchCurrentUser();
  } catch (e: any) {
    toastStore.error(t('profile.messages.update-nickname-failed'), e.message || t('profile.messages.system-busy'));
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
      toastStore.success(t('profile.messages.bind-success'), t('profile.messages.bind-success-detail'));
      // Force refresh user data
      auth.user = null;
      await auth.fetchCurrentUser();
    } catch (e: any) {
      toastStore.error(t('profile.messages.bind-failed'), e.message || t('profile.messages.bind-failed-reason'));
    } finally {
      bindLoading.value = false;
    }
  }
});
</script>