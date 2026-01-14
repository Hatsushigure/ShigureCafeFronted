<template>
  <div class="min-h-screen bg-gray-50">
    <NavBar />

    <div class="py-10 transition-all duration-500 ease-in-out">
      <header>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div class="flex items-center space-x-4">
            <button @click="$router.back()" class="p-2 rounded-full hover:bg-gray-200 transition-colors text-gray-600">
              <ArrowLeft class="h-6 w-6" />
            </button>
            <h1 class="text-3xl font-extrabold leading-tight text-gray-900 tracking-tight animate-slide-up">
              公告详情
            </h1>
          </div>
          <button 
            v-if="auth.user?.role === 'ADMIN' && notice" 
            @click="$router.push(`/admin/notices/${notice.id}/edit?redirect=/notices/${notice.id}`)" 
            class="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm font-bold text-sm animate-slide-up animate-delay-50"
          >
            <Edit2 class="h-4 w-4" />
            <span>编辑公告</span>
          </button>
        </div>
      </header>
      <main>
        <div class="max-w-4xl mx-auto sm:px-6 lg:px-8 mt-8">
          <div class="px-4 sm:px-0 animate-slide-up animate-delay-100">
             <div v-if="loading" class="bg-white shadow rounded-2xl p-12 flex justify-center items-center text-gray-400">
                <Loader2 class="h-8 w-8 animate-spin" />
             </div>
             <div v-else-if="!notice" class="bg-white shadow rounded-2xl p-12 text-center text-gray-500">
                <p>公告不存在或已被删除</p>
                <button @click="$router.push('/notices')" class="mt-4 text-indigo-600 font-medium">查看所有公告</button>
             </div>
             <div v-else class="animate-slide-up animate-delay-150">
               <BaseCard 
                    body-class="p-8"
                    :class="notice.pinned ? 'border-orange-200 bg-orange-50/30 ring-1 ring-orange-100' : 'border-gray-100'"
               >
                <div class="flex items-start space-x-6">
                    <div class="flex-shrink-0">
                        <span class="inline-flex items-center justify-center h-12 w-12 rounded-full"
                          :class="notice.pinned ? 'bg-orange-100' : 'bg-blue-100'"
                        >
                          <svg class="h-8 w-8" :class="notice.pinned ? 'text-orange-600' : 'text-blue-600'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                        </span>
                    </div>
                    <div class="flex-1">
                        <div class="flex justify-between items-start mb-6">
                          <div class="flex items-center">
                            <h4 class="text-2xl font-bold text-gray-900">{{ notice.title }}</h4>
                            <span v-if="notice.pinned" class="ml-3 px-2 py-1 text-xs font-bold uppercase tracking-wider bg-orange-100 text-orange-700 rounded-md">
                              置顶
                            </span>
                          </div>
                          <div class="text-right">
                            <span class="block text-sm text-gray-500">{{ formatDateTime(notice.createdAt) }}</span>
                          </div>
                        </div>
                        <div class="prose prose-indigo max-w-none text-gray-700 leading-relaxed" v-html="renderMarkdown(notice.content)"></div>
                        
                        <!-- Emoji Reactions -->
                        <div v-if="notice" class="mt-8 pt-6 border-t border-gray-50">
                          <div class="flex flex-wrap items-center gap-2">
                            <button 
                              v-for="reaction in currentReactions" 
                              :key="reaction.emoji"
                              @click="handleReaction(reaction.emoji)"
                              class="flex items-center space-x-2 px-3 py-1.5 rounded-full border transition-all duration-200 transform active:scale-95"
                              :class="reaction.reacted 
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 ring-1 ring-indigo-200' 
                                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'"
                            >
                              <span class="text-lg leading-none">{{ reaction.emoji }}</span>
                              <span class="text-sm font-bold">{{ reaction.count }}</span>
                            </button>
                            
                            <div class="relative" ref="emojiPickerContainer">
                              <button 
                                @click="toggleEmojiPicker"
                                class="flex items-center justify-center h-9 w-9 rounded-full border border-gray-200 bg-white text-gray-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all duration-200"
                                title="添加回应"
                              >
                                <Plus class="h-5 w-5" />
                              </button>
                              
                              <Transition name="emoji-pop">
                                <div v-if="showEmojiPicker" class="absolute bottom-full mb-3 left-0 z-50 bg-white shadow-2xl border border-gray-100 rounded-2xl p-3 grid grid-cols-4 gap-1 min-w-[180px] origin-bottom-left">
                                  <button 
                                    v-for="emoji in commonEmojis" 
                                    :key="emoji"
                                    @click="handleReaction(emoji); showEmojiPicker = false"
                                    class="h-10 w-10 flex items-center justify-center text-xl hover:bg-indigo-50 rounded-xl transition-colors transform hover:scale-110 active:scale-90"
                                  >
                                    {{ emoji }}
                                  </button>
                                </div>
                              </Transition>
                            </div>
                          </div>
                        </div>

                        <div class="mt-10 flex items-center justify-between border-t border-gray-100 pt-6">
                           <div class="flex items-center text-sm text-gray-500">
                             <div class="mr-3 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                                {{ notice.authorNickname?.charAt(0) || '?' }}
                             </div>
                             <div>
                               <span class="font-bold text-gray-900 block">{{ notice.authorNickname }}</span>
                               <span v-if="notice.updatedAt !== notice.createdAt" class="text-xs text-gray-400 italic">已编辑于 {{ formatDateTime(notice.updatedAt) }}</span>
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
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useNoticeStore, type Notice } from '../stores/notice';
import NavBar from '../components/NavBar.vue';
import BaseCard from '../components/BaseCard.vue';
import { Loader2, ArrowLeft, Edit2, Plus } from 'lucide-vue-next';
import { marked } from 'marked';
import { formatDateTime } from '../utils/formatters';

const route = useRoute();
const auth = useAuthStore();
const noticeStore = useNoticeStore();
const notice = ref<Notice | null>(null);
const loading = ref(true);
const showEmojiPicker = ref(false);
const emojiPickerContainer = ref<HTMLElement | null>(null);
const commonEmojis = [
  '👍', '👎', '❤️', '🔥', 
  '😄', '🎉', '😮', '😢', 
  '💯', '👏', '🙌', '✨', 
  '🤔', '👀', '🚀', '✅'
];

const currentReactions = computed(() => {
    return notice.value ? noticeStore.getReactions(notice.value.id) : [];
});

const toggleEmojiPicker = () => {
  showEmojiPicker.value = !showEmojiPicker.value;
};

const handleClickOutside = (event: MouseEvent) => {
  if (showEmojiPicker.value && emojiPickerContainer.value && !emojiPickerContainer.value.contains(event.target as Node)) {
    showEmojiPicker.value = false;
  }
};

const handleReaction = async (emoji: string) => {
  if (!notice.value) return;
  try {
    await noticeStore.toggleReaction(notice.value.id, emoji);
    // State updates automatically via store
  } catch (error) {
    console.error('Failed to toggle reaction', error);
  }
};

const fetchNotice = async () => {
  const id = Number(route.params.id);
  // Try to get from store first
  const cached = noticeStore.getNoticeById(id);
  if (cached) {
    notice.value = cached;
    loading.value = false;
  }

  try {
    // If not cached or if we want to refresh content anyway
    if (!cached) {
        const data = await noticeStore.fetchNoticeById(id);
        notice.value = data;
    }
    // Fetch reactions separately
    await noticeStore.fetchReactions(id);
  } catch (error) {
    console.error('Failed to fetch notice', error);
  } finally {
    loading.value = false;
  }
};

const renderMarkdown = (content: string) => {
  return marked.parse(content);
};

onMounted(async () => {
  fetchNotice();
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
</style>