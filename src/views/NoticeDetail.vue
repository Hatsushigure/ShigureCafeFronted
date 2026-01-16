<template>
  <div class="min-h-screen bg-gray-50">
    <NavBar />

    <div class="py-10 transition-all duration-500 ease-in-out">
      <header>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div class="flex items-center space-x-4">
            <button @click="$router.push('/notices')" class="p-2 rounded-full hover:bg-gray-200 transition-colors text-gray-600">
              <ArrowLeft class="h-6 w-6" />
            </button>
            <h1 class="text-3xl font-extrabold leading-tight text-gray-900 tracking-tight animate-slide-up">
              {{ t('notices.detail.title') }}
            </h1>
          </div>
          <div class="flex items-center space-x-3">
            <button v-if="auth.user?.role === 'ADMIN' && notice"
              @click="$router.push(`/admin/notices/${notice.id}/edit?redirect=/notices/${notice.id}`)"
              class="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm font-bold text-sm animate-slide-up animate-delay-50">
              <Edit2 class="h-4 w-4" />
              <span>{{ t('notices.detail.edit-button') }}</span>
            </button>
            <button v-if="auth.user?.role === 'ADMIN' && notice" @click="showDeleteModal = true"
              class="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl hover:bg-red-100 transition-colors shadow-sm font-bold text-sm animate-slide-up animate-delay-75">
              <Trash2 class="h-4 w-4" />
              <span>{{ t('notices.delete') }}</span>
            </button>
          </div>
        </div>
      </header>
      <main>
        <div class="max-w-4xl mx-auto sm:px-6 lg:px-8 mt-8">
          <div class="px-4 sm:px-0 animate-slide-up animate-delay-100">
            <div v-if="loading" class="bg-white shadow rounded-2xl p-12 flex justify-center items-center">
              <div class="flex flex-col items-center space-y-4">
                <Loader2 class="h-10 w-10 animate-spin text-indigo-600" />
                <p class="text-gray-400 text-sm font-medium animate-pulse">{{ t('common.loading') }}</p>
              </div>
            </div>
            <div v-else-if="!notice" class="bg-white shadow rounded-2xl p-12 text-center text-gray-500">
              <p>{{ t('notices.detail.not-found') }}</p>
              <button @click="$router.push('/notices')" class="mt-4 text-indigo-600 font-medium">{{
                t('notices.detail.view-all') }}</button>
            </div>
            <div v-else class="relative animate-slide-up animate-delay-150">
              <!-- Refreshing Overlay -->
              <div v-if="noticeStore.loading" 
                class="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-2xl transition-all duration-300">
                <Loader2 class="h-8 w-8 animate-spin text-indigo-500" />
              </div>

              <BaseCard body-class="p-8" :class="[
                notice.pinned ? 'border-orange-200 bg-orange-50/30 ring-1 ring-orange-100' : 'border-gray-100',
                '!overflow-visible'
              ]">
                <div class="flex items-start space-x-6">
                  <div class="flex-shrink-0">
                    <span class="inline-flex items-center justify-center h-12 w-12 rounded-full"
                      :class="notice.pinned ? 'bg-orange-100' : 'bg-blue-100'">
                      <svg class="h-8 w-8" :class="notice.pinned ? 'text-orange-600' : 'text-blue-600'" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </span>
                  </div>
                                      <div class="flex-1 min-w-0">
                                        <div class="flex justify-between items-start mb-6">
                                          <div class="flex items-center min-w-0">
                                            <h4 class="text-2xl font-bold text-gray-900 break-words">{{ notice.title }}</h4>
                                            <span v-if="notice.pinned"
                                              class="ml-3 px-2 py-1 text-xs font-bold uppercase tracking-wider bg-orange-100 text-orange-700 rounded-md flex-shrink-0">
                                              {{ t('notices.pinned') }}
                                            </span>
                                          </div>
                                          <div class="text-right ml-4 flex-shrink-0">
                                            <span class="block text-sm text-gray-500">{{ formatDateTime(notice.createdAt) }}</span>
                                          </div>
                                        </div>
                                        <div class="prose prose-indigo max-w-none text-gray-700 leading-relaxed break-words"
                                          v-html="renderMarkdown(notice.content)"></div>
                    <!-- Emoji Reactions -->
                    <div v-if="notice" class="mt-8 pt-6 border-t border-gray-50">
                      <div class="flex flex-wrap items-center gap-2">
                        <button v-for="reaction in currentReactions" :key="reaction.type"
                          @click="handleReaction(reaction.type)"
                          class="flex items-center space-x-2 px-3 py-1.5 rounded-full border transition-all duration-200 transform active:scale-95"
                          :class="reaction.reacted
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700 ring-1 ring-indigo-200'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'">
                          <span class="text-lg leading-none">{{ getEmoji(reaction.type) }}</span>
                          <span class="text-sm font-bold">{{ reaction.count }}</span>
                        </button>

                        <div class="relative" ref="emojiPickerContainer">
                          <button @click="toggleEmojiPicker"
                            class="flex items-center justify-center h-9 w-9 rounded-full border border-gray-200 bg-white text-gray-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all duration-200"
                            :title="t('notices.detail.add-reaction')">
                            <Plus class="h-5 w-5" />
                          </button>

                          <Transition name="emoji-pop">
                            <div v-if="showEmojiPicker" :class="[
                              'absolute z-50 bg-white shadow-2xl border border-gray-100 rounded-2xl p-2 w-64',
                              pickerAlignment.top ? 'bottom-full mb-3' : 'top-full mt-3',
                              pickerAlignment.left ? 'left-0' : 'right-0',
                              pickerAlignment.top
                                ? (pickerAlignment.left ? 'origin-bottom-left' : 'origin-bottom-right')
                                : (pickerAlignment.left ? 'origin-top-left' : 'origin-top-right')
                            ]">
                              <div class="max-h-48 overflow-y-auto p-1 custom-scrollbar">
                                <div class="grid grid-cols-5 gap-1">
                                  <button v-for="type in availableReactions" :key="type"
                                    @click="handleReaction(type); showEmojiPicker = false"
                                    class="h-10 w-10 flex items-center justify-center text-xl hover:bg-indigo-50 rounded-lg transition-all duration-200 transform hover:scale-110 active:scale-90"
                                    :title="type">
                                    {{ getEmoji(type) }}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </Transition>
                        </div>
                      </div>
                    </div>

                    <div class="mt-10 flex items-center justify-between border-t border-gray-100 pt-6">
                      <div class="flex items-center text-sm text-gray-500">
                        <UserAvatar :name="authorProfile?.nickname || notice.authorUsername" :src="authorProfile?.avatarUrl" size="sm" custom-class="mr-3" />
                        <div>
                          <span class="font-bold text-gray-900 block">{{ authorProfile?.nickname || notice.authorUsername }}</span>
                          <span v-if="notice.updatedAt !== notice.createdAt" class="text-xs text-gray-400 italic">
                            {{ t('notices.detail.edited-at', { time: formatDateTime(notice.updatedAt) }) }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </BaseCard>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Delete Confirmation Modal -->
    <Modal :show="showDeleteModal" :title="t('notices.delete-modal.title')" max-width="md" @close="showDeleteModal = false">
      <div class="mt-2">
        <p class="text-sm text-gray-500">
          {{ t('notices.delete-modal.confirmation', { title: notice?.title }) }}
        </p>
      </div>

      <template #footer>
        <BaseButton variant="danger" :loading="deleting" @click="handleDelete">
          {{ t('notices.delete-modal.confirm') }}
        </BaseButton>
        <BaseButton variant="outline" @click="showDeleteModal = false">
          {{ t('common.cancel') }}
        </BaseButton>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '../stores/auth';
import { useNoticeStore, type Notice } from '../stores/notice';
import { useSystemStore } from '../stores/system';
import { useUserStore } from '../stores/user';
import NavBar from '../components/NavBar.vue';
import BaseCard from '../components/BaseCard.vue';
import UserAvatar from '../components/UserAvatar.vue';
import Modal from '../components/Modal.vue';
import BaseButton from '../components/BaseButton.vue';
import { Loader2, ArrowLeft, Edit2, Plus, Trash2 } from 'lucide-vue-next';
import { renderMarkdown } from '../utils/markdown';
import { formatDateTime } from '../utils/formatters';
import { useRouter } from 'vue-router';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const noticeStore = useNoticeStore();
const systemStore = useSystemStore();
const userStore = useUserStore();
const notice = ref<Notice | null>(null);

const authorProfile = computed(() => notice.value ? userStore.profiles[notice.value.authorUsername] : null);
const loading = ref(true);
const deleting = ref(false);
const showDeleteModal = ref(false);
const showEmojiPicker = ref(false);
const emojiPickerContainer = ref<HTMLElement | null>(null);
const pickerAlignment = ref({ top: true, left: true });

const availableReactions = computed(() => systemStore.reactionTypes.map(r => r.name));
const getEmoji = (type: string) => systemStore.reactionMap[type] || '❓';

const currentReactions = computed(() => {
  return notice.value ? noticeStore.getReactions(notice.value.id) : [];
});

const toggleEmojiPicker = (event: MouseEvent) => {
  if (!showEmojiPicker.value) {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const spaceAbove = rect.top;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceRight = window.innerWidth - rect.left;

    // 300px is roughly the height (max-h-48 + padding) + some margin
    pickerAlignment.value = {
      top: spaceAbove > 250 || spaceAbove > spaceBelow,
      left: spaceRight > 260 // w-64 is 256px
    };
  }
  showEmojiPicker.value = !showEmojiPicker.value;
};

const handleClickOutside = (event: MouseEvent) => {
  if (showEmojiPicker.value && emojiPickerContainer.value && !emojiPickerContainer.value.contains(event.target as Node)) {
    showEmojiPicker.value = false;
  }
};

const handleReaction = async (type: string) => {
  if (!notice.value) return;
  try {
    await noticeStore.toggleReaction(notice.value.id, type);
    // State updates automatically via store
  } catch (error) {
    // Handled by store/toast
  }
};

const handleDelete = async () => {
  if (!notice.value) return;
  deleting.value = true;
  try {
    await noticeStore.deleteNotice(notice.value.id);
    router.push('/notices');
  } catch (error) {
    // Handled by store
  } finally {
    deleting.value = false;
    showDeleteModal.value = false;
  }
};

const fetchNotice = async () => {
  const id = Number(route.params.id);
  if (isNaN(id)) {
    loading.value = false;
    return;
  }

  // Try to get from store first for immediate display
  const cached = noticeStore.getNoticeById(id);
  if (cached) {
    notice.value = cached;
    userStore.fetchProfile(cached.authorUsername);
    loading.value = false;
  } else {
    loading.value = true;
  }

  try {
    // Always fetch from server to ensure latest content
    const data = await noticeStore.fetchNoticeById(id);
    notice.value = data;
    // Fetch author profile
    userStore.fetchProfile(data.authorUsername);
    // Fetch reactions separately
    await noticeStore.fetchReactions(id);
  } catch (error) {
    // Handled by store/toast
  } finally {
    loading.value = false;
  }
};

watch(() => route.params.id, (newId) => {
  if (newId && route.name === 'NoticeDetail') {
    fetchNotice();
  }
});

onMounted(async () => {
  fetchNotice();
  systemStore.fetchReactionTypes();
  document.addEventListener('mousedown', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside);
});
</script>

<style scoped>
.emoji-pop-enter-active {
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.emoji-pop-leave-active {
  transition: all 0.15s cubic-bezier(0.4, 0, 1, 1);
}

.emoji-pop-enter-from,
.emoji-pop-leave-to {
  transform: scale(0.5);
  opacity: 0;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}
</style>