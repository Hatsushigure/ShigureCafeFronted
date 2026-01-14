<template>
  <div class="min-h-screen bg-gray-50">
    <NavBar />

    <div class="py-10 transition-all duration-500 ease-in-out">
      <header>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div class="flex items-center space-x-4" v-if="!isSearchExpanded">
            <button @click="$router.back()" class="p-2 rounded-full hover:bg-gray-200 transition-colors text-gray-600">
              <ArrowLeft class="h-6 w-6" />
            </button>
            <h1 class="text-2xl sm:text-3xl font-extrabold leading-tight text-gray-900 tracking-tight animate-slide-up">
              所有公告
            </h1>
          </div>

          <div 
            class="flex items-center transition-all duration-300 ease-in-out" 
            :class="isSearchExpanded ? 'flex-1 justify-end' : 'space-x-2 sm:space-x-4'"
          >
            <!-- Search Box -->
            <div 
              class="relative flex items-center transition-all duration-300 ease-in-out" 
              :class="isSearchExpanded ? 'w-full' : 'w-auto'"
            >
              <!-- Mobile Search Toggle -->
              <button 
                @click="isSearchExpanded = true"
                v-if="!isSearchExpanded"
                class="sm:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors animate-slide-up animate-delay-50"
              >
                <Search class="h-5 w-5" />
              </button>

              <!-- Search Input Container -->
              <div 
                class="relative transition-all duration-300 ease-in-out"
                :class="[
                  isSearchExpanded ? 'w-full opacity-100' : 'hidden sm:block sm:w-64 opacity-100'
                ]"
              >
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search class="h-4 w-4 text-gray-400" />
                </div>
                <input
                  v-model="searchQuery"
                  ref="searchInput"
                  type="text"
                  placeholder="搜索公告标题/作者..."
                  class="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200"
                  @keyup.esc="isSearchExpanded = false"
                />
                <!-- Mobile Close button -->
                <button 
                  v-if="isSearchExpanded"
                  @click="isSearchExpanded = false"
                  class="sm:hidden absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X class="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              </div>
            </div>

            <div v-show="!isSearchExpanded" class="flex items-center space-x-2 sm:space-x-3">
              <BaseButton v-if="auth.user?.role === 'ADMIN'" @click="$router.push('/admin/notices/new')" class="animate-slide-up animate-delay-50">
                <Plus class="h-4 w-4 sm:mr-2" />
                <span class="hidden sm:inline">发布公告</span>
              </BaseButton>
              <BaseButton variant="secondary" @click="handlePageChange(0, true)" :loading="noticeStore.loading"
                class="animate-slide-up animate-delay-50">
                <RotateCw v-if="!noticeStore.loading" class="h-4 w-4 sm:mr-2" />
                <span class="hidden sm:inline">刷新</span>
              </BaseButton>
              <div class="hidden md:block text-sm text-gray-500 animate-slide-up animate-delay-100 ml-2">
                共 {{ noticeStore.totalElements }} 条
              </div>
            </div>
          </div>
        </div>
      </header>
      <main>
        <div class="max-w-4xl mx-auto sm:px-6 lg:px-8 mt-8">
          <div class="px-4 sm:px-0">
             <Transition name="fade-slide" mode="out-in">
               <div :key="noticeStore.loading ? 'loading' : (filteredNotices.length > 0 ? 'data' : 'empty')">
                 <div v-if="noticeStore.loading" class="bg-white shadow rounded-2xl p-12 flex justify-center items-center text-gray-400">
                    <Loader2 class="h-8 w-8 animate-spin" />
                 </div>
                 <div v-else-if="filteredNotices.length === 0" class="bg-white shadow rounded-2xl p-12 text-center text-gray-500 flex flex-col items-center">
                    <Megaphone class="h-12 w-12 text-gray-300 mb-3" />
                    <p>{{ searchQuery ? '未找到匹配的公告' : '暂无公告' }}</p>
                 </div>
                 <div v-else class="space-y-6">
                    <div v-for="(notice, index) in filteredNotices" :key="notice.id"
                      class="animate-slide-up"
                      :style="{ animationDelay: `${(index + 3) * 50}ms` }"
                    >
                      <BaseCard 
                        @click="$router.push(`/notices/${notice.id}`)"
                        hoverable
                        body-class="p-6"
                        :class="notice.pinned ? 'border-orange-200 bg-orange-50/30 ring-1 ring-orange-100' : 'border-gray-100'"
                      >
                        <div class="flex items-start space-x-4">
                        <div class="flex-shrink-0">
                            <span class="inline-flex items-center justify-center h-10 w-10 rounded-full"
                              :class="notice.pinned ? 'bg-orange-100' : 'bg-blue-100'"
                            >
                              <svg class="h-6 w-6" :class="notice.pinned ? 'text-orange-600' : 'text-blue-600'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                              </svg>
                            </span>
                        </div>
                        <div class="flex-1">
                            <div class="flex justify-between items-start">
                              <div class="flex items-center">
                                <h4 class="text-xl font-bold text-gray-900">{{ notice.title }}</h4>
                                <span v-if="notice.pinned" class="ml-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-700 rounded-md">
                                  置顶
                                </span>
                              </div>
                              <span class="text-sm text-gray-400">{{ formatDateTime(notice.createdAt) }}</span>
                            </div>
                            <div class="mt-4 prose prose-slate max-w-none text-gray-600 line-clamp-3 overflow-hidden" v-html="renderMarkdown(notice.content)"></div>
                            
                            <!-- Reaction Summary -->
                            <div v-if="noticeStore.getReactions(notice.id).length > 0" class="mt-3 flex flex-wrap items-center gap-1.5">
                              <span 
                                v-for="reaction in noticeStore.getReactions(notice.id).slice(0, 5)" 
                                :key="reaction.emoji"
                                class="inline-flex items-center space-x-1 text-[10px] font-bold text-gray-500 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full"
                              >
                                <span>{{ reaction.emoji }}</span>
                                <span>{{ reaction.count }}</span>
                              </span>
                              <span v-if="noticeStore.getReactions(notice.id).length > 5" class="text-[10px] text-gray-400">...</span>
                            </div>

                            <div class="mt-6 flex items-center justify-between border-t border-gray-50 pt-4">
                               <div class="flex items-center text-sm text-gray-500">
                                 <span class="font-medium text-gray-900 mr-2">{{ notice.authorNickname }}</span>
                                 <span v-if="notice.updatedAt !== notice.createdAt" class="italic"> (已编辑于 {{ formatDateTime(notice.updatedAt) }})</span>
                               </div>
                               <div class="flex items-center space-x-4">
                                 <template v-if="auth.user?.role === 'ADMIN'">
                                   <button @click.stop="$router.push(`/admin/notices/${notice.id}/edit?redirect=/notices`)" class="text-sm font-bold text-gray-500 hover:text-indigo-600 transition-colors flex items-center">
                                     <Edit2 class="h-4 w-4 mr-1" />
                                     编辑
                                   </button>
                                   <button @click.stop="confirmDelete(notice)" class="text-sm font-bold text-red-500 hover:text-red-600 transition-colors flex items-center">
                                     <Trash2 class="h-4 w-4 mr-1" />
                                     删除
                                   </button>
                                 </template>
                                 <button @click.stop="$router.push(`/notices/${notice.id}`)" class="text-sm font-bold text-indigo-600 hover:text-indigo-500 transition-colors flex items-center">
                                   阅读全文
                                   <ChevronRight class="h-4 w-4 ml-1" />
                                 </button>
                               </div>
                            </div>
                        </div>
                      </div>
                    </BaseCard>
                  </div>

                  <!-- Pagination Controls -->
                  <div class="mt-8 flex items-center justify-between pb-10">
                    <div class="flex-1 flex justify-between sm:hidden">
                      <BaseButton 
                        variant="secondary" 
                        :disabled="searchQuery ? true : noticeStore.currentPage === 0"
                        @click="handlePageChange(noticeStore.currentPage - 1)"
                      >
                        上一页
                      </BaseButton>
                      <BaseButton 
                        variant="secondary"
                        :disabled="searchQuery ? true : noticeStore.currentPage >= noticeStore.totalPages - 1"
                        @click="handlePageChange(noticeStore.currentPage + 1)"
                      >
                        下一页
                      </BaseButton>
                    </div>
                    <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-center">
                      <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button 
                          @click="handlePageChange(noticeStore.currentPage - 1)"
                          :disabled="searchQuery ? true : noticeStore.currentPage === 0"
                          class="relative inline-flex items-center px-2 py-2 rounded-l-xl border border-gray-200 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          <span class="sr-only">Previous</span>
                          <ChevronLeft class="h-5 w-5" />
                        </button>
                        
                        <template v-if="searchQuery">
                          <button
                            class="z-10 bg-indigo-50 border-indigo-500 text-indigo-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                          >
                            1
                          </button>
                        </template>
                        <template v-else>
                          <button 
                            v-for="page in noticeStore.totalPages" 
                            :key="page"
                            @click="handlePageChange(page - 1)"
                            :class="[
                              noticeStore.currentPage === page - 1 
                                ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600' 
                                : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50',
                              'relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-all'
                            ]"
                          >
                            {{ page }}
                          </button>
                        </template>

                        <button 
                          @click="handlePageChange(noticeStore.currentPage + 1)"
                          :disabled="searchQuery ? true : noticeStore.currentPage >= noticeStore.totalPages - 1"
                          class="relative inline-flex items-center px-2 py-2 rounded-r-xl border border-gray-200 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          <span class="sr-only">Next</span>
                          <ChevronRight class="h-5 w-5" />
                        </button>
                      </nav>
                    </div>
                  </div>
                 </div>
               </div>
             </Transition>
          </div>
        </div>
      </main>

      <!-- Delete Confirmation Modal -->
      <Modal :show="showDeleteModal" title="删除公告" @close="showDeleteModal = false">
        <div class="sm:flex sm:items-center">
          <div
            class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
            <Trash2 class="h-6 w-6 text-red-600" />
          </div>
          <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <div class="mt-2">
              <p class="text-sm text-gray-500">
                您确定要删除公告 <span class="font-bold text-gray-900">{{ selectedNotice?.title }}</span> 吗？此操作不可撤销。
              </p>
            </div>
          </div>
        </div>
        <template #footer>
          <BaseButton variant="danger" @click="handleDelete" label="确认删除" />
          <BaseButton variant="outline" @click="showDeleteModal = false" label="取消" />
        </template>
      </Modal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useNoticeStore, type Notice } from '../stores/notice';
import { useToastStore } from '../stores/toast';
import NavBar from '../components/NavBar.vue';
import BaseCard from '../components/BaseCard.vue';
import BaseButton from '../components/BaseButton.vue';
import Modal from '../components/Modal.vue';
import api from '../api';
import { 
  Loader2, ArrowLeft, ChevronRight, Edit2, ChevronLeft, 
  Search, Plus, RotateCw, X, Trash2, Megaphone 
} from 'lucide-vue-next';
import { marked } from 'marked';
import { formatDateTime } from '../utils/formatters';

const auth = useAuthStore();
const noticeStore = useNoticeStore();
const toast = useToastStore();

const searchQuery = ref('');
const isSearchExpanded = ref(false);
const searchInput = ref<HTMLInputElement | null>(null);
const showDeleteModal = ref(false);
const selectedNotice = ref<Notice | null>(null);

watch(isSearchExpanded, (val) => {
  if (val) {
    nextTick(() => {
      searchInput.value?.focus();
    });
  }
});

const filteredNotices = computed(() => {
  const notices = noticeStore.currentNotices;
  if (!searchQuery.value) return notices;
  const q = searchQuery.value.toLowerCase();
  return notices.filter(notice => 
    notice.title.toLowerCase().includes(q) ||
    notice.authorNickname?.toLowerCase().includes(q)
  );
});

const renderMarkdown = (content: string) => {
  return marked.parse(content);
};

const handlePageChange = async (page: number, force = false) => {
    await noticeStore.fetchNotices(page, 10, force);
    fetchReactions();
};

const fetchReactions = () => {
    const ids = noticeStore.currentNotices.map(n => n.id);
    if (ids.length > 0) {
        noticeStore.fetchReactionsForList(ids);
    }
};

const confirmDelete = (notice: Notice) => {
  selectedNotice.value = notice;
  showDeleteModal.value = true;
};

const handleDelete = async () => {
  if (!selectedNotice.value) return;
  try {
    await api.delete(`/notices/${selectedNotice.value.id}`);
    toast.success('公告已删除');
    showDeleteModal.value = false;
    handlePageChange(noticeStore.currentPage, true);
  } catch (error: any) {
    toast.error('删除失败', error.message);
  }
};

onMounted(async () => {
  if (!auth.user) {
    await auth.fetchCurrentUser();
  }
  await noticeStore.fetchNotices();
  fetchReactions();
});
</script>