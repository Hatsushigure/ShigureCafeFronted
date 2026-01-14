<template>
  <div class="min-h-screen bg-gray-50">
    <NavBar />

    <div class="py-10 transition-all duration-500 ease-in-out">
      <header>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <h1 
            v-if="!isSearchExpanded"
            class="text-2xl sm:text-3xl font-extrabold leading-tight text-gray-900 tracking-tight animate-slide-up"
          >
            公告管理
          </h1>

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

            <div v-show="!isSearchExpanded" class="flex space-x-2 sm:space-x-3">
              <BaseButton @click="$router.push('/admin/notices/new')" class="animate-slide-up animate-delay-50">
                <Plus class="h-4 w-4 sm:mr-2" />
                <span class="hidden sm:inline">发布公告</span>
              </BaseButton>
              <BaseButton variant="secondary" @click="fetchNotices(0, true)" :loading="noticeStore.loading"
                class="animate-slide-up animate-delay-50">
                <RotateCw v-if="!noticeStore.loading" class="h-4 w-4 sm:mr-2" />
                <span class="hidden sm:inline">刷新</span>
              </BaseButton>
            </div>
          </div>
        </div>
      </header>

      <main>
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8 mt-8">
          <div class="px-4 sm:px-0">
            <Transition name="fade-slide" mode="out-in">
              <div :key="noticeStore.loading ? 'loading' : (noticeStore.currentNotices.length > 0 ? 'data' : 'empty')">
                <BaseCard body-class="p-0 overflow-hidden">
                  <!-- Loading State -->
                  <div v-if="noticeStore.loading" class="p-12 flex justify-center items-center text-gray-400">
                    <Loader2 class="h-8 w-8 animate-spin" />
                  </div>

                  <!-- Empty State -->
                  <div v-else-if="filteredNotices.length === 0"
                    class="p-12 text-center text-gray-500 flex flex-col items-center">
                    <Megaphone class="h-12 w-12 text-gray-300 mb-3" />
                    <p>{{ searchQuery ? '未找到匹配的公告' : '暂无公告数据' }}</p>
                  </div>

                  <!-- Notices Table -->
                  <div v-else>
                    <CustomScrollContainer>
                      <table class="min-w-full divide-y divide-gray-200">
                      <thead class="bg-gray-50/50">
                        <tr>
                          <th scope="col"
                            class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">标题
                          </th>
                          <th scope="col"
                            class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">作者
                          </th>
                          <th scope="col"
                            class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">发布时间
                          </th>
                          <th scope="col"
                            class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">最后更新
                          </th>
                          <th scope="col"
                            class="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作
                          </th>
                        </tr>
                      </thead>
                      <tbody class="bg-white divide-y divide-gray-100">
                        <tr v-for="notice in filteredNotices" :key="notice.id"
                          class="hover:bg-gray-50/80 transition-colors duration-150">
                          <td class="px-6 py-4 whitespace-nowrap">
                            <div class="flex items-center">
                              <span v-if="notice.pinned"
                                class="mr-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-700 rounded-md">
                                置顶
                              </span>
                              <div class="text-sm font-medium text-gray-900 truncate max-w-[200px]"
                                :title="notice.title">
                                {{ truncateText(notice.title) }}
                              </div>
                            </div>
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500" :title="notice.authorNickname">
                            {{ truncateText(notice.authorNickname) }}
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {{ formatDateTime(notice.createdAt) }}
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {{ formatDateTime(notice.updatedAt) }}
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                            <button @click="$router.push(`/admin/notices/${notice.id}/edit`)"
                              class="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 p-1.5 rounded-md transition-colors"
                              title="编辑公告">
                              <Edit2 class="h-4 w-4" />
                            </button>
                            <button @click="confirmDelete(notice)"
                              class="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-1.5 rounded-md transition-colors"
                              title="删除公告">
                              <Trash2 class="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    </CustomScrollContainer>

                    <!-- Pagination Controls -->
                    <div class="px-6 py-4 bg-gray-50/30 border-t border-gray-100 flex items-center justify-between">
                      <div class="flex-1 flex justify-between sm:hidden">
                        <BaseButton variant="secondary" :disabled="searchQuery ? true : noticeStore.currentPage === 0"
                          @click="fetchNotices(noticeStore.currentPage - 1)">
                          上一页
                        </BaseButton>
                        <BaseButton variant="secondary"
                          :disabled="searchQuery ? true : noticeStore.currentPage >= noticeStore.totalPages - 1"
                          @click="fetchNotices(noticeStore.currentPage + 1)">
                          下一页
                        </BaseButton>
                      </div>
                      <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                          <p class="text-sm text-gray-700">
                            显示第 <span class="font-medium">{{ (searchQuery ? filteredNotices.length > 0 : noticeStore.totalElements > 0) ? (searchQuery ? 1 : noticeStore.currentPage * noticeStore.pageSize + 1) : 0 }}</span> 到第 <span class="font-medium">{{ searchQuery ? filteredNotices.length : Math.min((noticeStore.currentPage + 1) * noticeStore.pageSize, noticeStore.totalElements) }}</span> 条，共 <span
                              class="font-medium">{{ searchQuery ? filteredNotices.length : noticeStore.totalElements }}</span> 条结果
                          </p>
                        </div>
                        <div>
                          <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                            aria-label="Pagination">
                            <button @click="fetchNotices(noticeStore.currentPage - 1)"
                              :disabled="searchQuery ? true : noticeStore.currentPage === 0"
                              class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
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
                              <button v-for="page in noticeStore.totalPages" :key="page" @click="fetchNotices(page - 1)"
                                :class="[
                                  noticeStore.currentPage === page - 1
                                    ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50',
                                  'relative inline-flex items-center px-4 py-2 border text-sm font-medium'
                                ]">
                                {{ page }}
                              </button>
                            </template>

                            <button @click="fetchNotices(noticeStore.currentPage + 1)"
                              :disabled="searchQuery ? true : noticeStore.currentPage >= noticeStore.totalPages - 1"
                              class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                              <span class="sr-only">Next</span>
                              <ChevronRight class="h-5 w-5" />
                            </button>
                          </nav>
                        </div>
                      </div>
                    </div>
                  </div>
                </BaseCard>
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
import NavBar from '../components/NavBar.vue';
import BaseCard from '../components/BaseCard.vue';
import BaseButton from '../components/BaseButton.vue';
import Modal from '../components/Modal.vue';
import CustomScrollContainer from '../components/CustomScrollContainer.vue';
import api from '../api';
import { useNoticeStore, type Notice } from '../stores/notice';
import { useToastStore } from '../stores/toast';
import { truncateText, formatDateTime } from '../utils/formatters';
import { Plus, RotateCw, Loader2, Megaphone, Edit2, Trash2, ChevronLeft, ChevronRight, Search, X } from 'lucide-vue-next';

const noticeStore = useNoticeStore();
const searchQuery = ref('');
const isSearchExpanded = ref(false);
const searchInput = ref<HTMLInputElement | null>(null);
const showDeleteModal = ref(false);
const selectedNotice = ref<Notice | null>(null);
const toast = useToastStore();

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

const fetchNotices = async (page = 0, force = false) => {
  const minTimer = new Promise(resolve => setTimeout(resolve, 600));
  try {
    await noticeStore.fetchNotices(page, 10, force);
    await minTimer;
  } catch (error: any) {
    toast.error('获取公告失败', error.message);
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
    fetchNotices();
  } catch (error: any) {
    toast.error('删除失败', error.message);
  }
};

onMounted(() => {
  fetchNotices();
});
</script>