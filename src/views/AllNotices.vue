<template>
  <div class="min-h-screen bg-gray-50">
    <NavBar />

    <div class="py-10 transition-all duration-500 ease-in-out">
      <header>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div class="flex items-center" v-if="!isSearchExpanded">
            <h1 class="text-2xl sm:text-3xl font-extrabold leading-tight text-gray-900 tracking-tight animate-slide-up">
              {{ t('notices.title') }}
            </h1>
          </div>

          <div class="flex items-center transition-all duration-300 ease-in-out"
            :class="isSearchExpanded ? 'flex-1 justify-end' : 'space-x-2 sm:space-x-4'">
            <!-- Search Box -->
            <div class="relative flex items-center transition-all duration-300 ease-in-out"
              :class="isSearchExpanded ? 'w-full' : 'w-auto'">
              <!-- Mobile Search Toggle -->
              <button @click="isSearchExpanded = true" v-if="!isSearchExpanded"
                class="sm:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors animate-slide-up animate-delay-50">
                <Search class="h-5 w-5" />
              </button>

              <!-- Search Input Container -->
              <div class="relative transition-all duration-300 ease-in-out" :class="[
                isSearchExpanded ? 'w-full opacity-100' : 'hidden sm:block sm:w-64 opacity-100'
              ]">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search class="h-4 w-4 text-gray-400" />
                </div>
                <input v-model="searchQuery" ref="searchInput" type="text"
                  :placeholder="t('notices.search-placeholder')"
                  class="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:border-blue-500 sm:text-sm transition-all duration-200"
                  @keyup.esc="isSearchExpanded = false" />
                <!-- Mobile Close button -->
                <button v-if="isSearchExpanded" @click="isSearchExpanded = false"
                  class="sm:hidden absolute inset-y-0 right-0 pr-3 flex items-center">
                  <X class="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              </div>
            </div>

            <div v-show="!isSearchExpanded" class="flex items-center space-x-2 sm:space-x-3">
              <BaseButton v-if="auth.user?.role === 'ADMIN'" @click="$router.push('/admin/notices/new')"
                class="animate-slide-up animate-delay-50">
                <Plus class="h-4 w-4 sm:mr-2" />
                <span class="hidden sm:inline">{{ t('notices.publish') }}</span>
              </BaseButton>
              <BaseButton variant="secondary" @click="handlePageChange(0, true)" :loading="noticeStore.loading"
                class="animate-slide-up animate-delay-50">
                <RotateCw v-if="!noticeStore.loading" class="h-4 w-4 sm:mr-2" />
                <span class="hidden sm:inline">{{ t('notices.refresh') }}</span>
              </BaseButton>
              <div class="hidden md:block text-sm text-gray-500 animate-slide-up animate-delay-100 ml-2">
                {{ t('notices.total-count', { count: noticeStore.totalElements }) }}
              </div>
            </div>
          </div>
        </div>
      </header>
      <main>
        <div class="max-w-4xl mx-auto sm:px-6 lg:px-8 mt-8">
          <div class="px-4 sm:px-0">
            <transition name="fade-slide" mode="out-in">
              <div
                :key="filteredNotices.length > 0 ? `notices-${noticeStore.currentPage}-${searchQuery}` : (noticeStore.loading ? 'loading' : 'empty')"
                class="min-h-[300px] relative">
                <!-- Loading overlay for refresh -->
                <div v-if="noticeStore.loading && filteredNotices.length > 0"
                  class="absolute inset-0 bg-gray-50/40 backdrop-blur-[1px] z-10 flex items-center justify-center transition-all duration-300">
                  <Loader2 class="h-8 w-8 animate-spin text-indigo-500" />
                </div>

                <div v-if="noticeStore.loading && noticeStore.currentNotices.length === 0"
                  class="bg-white shadow rounded-2xl min-h-[300px] flex justify-center items-center text-gray-400">
                  <Loader2 class="h-8 w-8 animate-spin" />
                </div>
                <div v-else-if="filteredNotices.length === 0"
                  class="bg-white shadow rounded-2xl min-h-[300px] text-center text-gray-500 flex flex-col items-center justify-center">
                  <Megaphone class="h-12 w-12 text-gray-300 mb-3" />
                  <p>{{ searchQuery ? t('notices.no-matching-notices') : t('notices.no-notices') }}</p>
                </div>
                <div v-else class="space-y-6">
                                  <div v-for="(notice, index) in filteredNotices" :key="notice.id" class="animate-slide-up"
                                    :style="{ animationDelay: `${(index + 3) * 50}ms` }">
                                    <NoticeCard 
                                      :notice="notice" 
                                      :is-admin="auth.user?.role === 'ADMIN'"
                                      @click="$router.push(`/notices/${notice.id}`)"
                                      @edit="$router.push(`/admin/notices/${notice.id}/edit?redirect=/notices`)"
                                      @delete="confirmDelete(notice)"
                                      @read="$router.push(`/notices/${notice.id}`)"
                                    />
                                  </div>
                  <!-- Pagination Controls -->
                  <Pagination v-if="filteredNotices.length > 0"
                    :current-page="searchQuery ? 0 : noticeStore.currentPage"
                    :total-pages="searchQuery ? Math.ceil(filteredNotices.length / noticeStore.pageSize) : noticeStore.totalPages"
                    :total-elements="searchQuery ? filteredNotices.length : noticeStore.totalElements"
                    :page-size="noticeStore.pageSize" @page-change="handlePageChange" class="mt-8 pb-10" />
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </main>

      <!-- Delete Confirmation Modal -->
      <Modal :show="showDeleteModal" :title="t('notices.delete-modal.title')" @close="showDeleteModal = false">
        <div class="sm:flex sm:items-center">
          <div
            class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
            <Trash2 class="h-6 w-6 text-red-600" />
          </div>
          <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <div class="mt-2">
              <p class="text-sm text-gray-500"
                v-html="t('notices.delete-modal.confirmation', { title: `<span class='font-bold text-gray-900'>${selectedNotice?.title}</span>` })">
              </p>
            </div>
          </div>
        </div>
        <template #footer>
          <BaseButton variant="danger" @click="handleDelete" :label="t('notices.delete-modal.confirm')" />
          <BaseButton variant="outline" @click="showDeleteModal = false" :label="t('common.cancel')" />
        </template>
      </Modal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '../stores/auth';
import { useNoticeStore, type Notice } from '../stores/notice';
import { useSystemStore } from '../stores/system';
import { useUserStore } from '../stores/user';
import NavBar from '../components/NavBar.vue';
import BaseButton from '../components/BaseButton.vue';
import NoticeCard from '../components/NoticeCard.vue';
import Modal from '../components/Modal.vue';
import Pagination from '../components/Pagination.vue';
import {
  Loader2,
  Search, Plus, RotateCw, X, Trash2, Megaphone
} from 'lucide-vue-next';

const auth = useAuthStore();
const noticeStore = useNoticeStore();
const systemStore = useSystemStore();
const userStore = useUserStore();
const { t } = useI18n();

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
  return notices.filter(notice => {
    const profile = userStore.profiles[notice.authorUsername];
    return notice.title.toLowerCase().includes(q) ||
      notice.authorUsername.toLowerCase().includes(q) ||
      profile?.nickname?.toLowerCase().includes(q);
  });
});

const handlePageChange = async (page: number, force = false) => {
  const isPageChange = page !== noticeStore.currentPage;
  if (isPageChange || force) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  await noticeStore.fetchNotices(page, 10, force);
  fetchReactions();
  fetchAuthorProfiles();
};

const fetchReactions = () => {
  const ids = noticeStore.currentNotices.map(n => n.id);
  if (ids.length > 0) {
    noticeStore.fetchReactionsForList(ids);
  }
};

const fetchAuthorProfiles = () => {
  const usernames = [...new Set(noticeStore.currentNotices.map(n => n.authorUsername))];
  usernames.forEach(username => {
    if (username) {
      userStore.fetchProfile(username);
    }
  });
};

const confirmDelete = (notice: Notice) => {
  selectedNotice.value = notice;
  showDeleteModal.value = true;
};

const handleDelete = async () => {
  if (!selectedNotice.value) return;
  try {
    await noticeStore.deleteNotice(selectedNotice.value.id);
    showDeleteModal.value = false;
    
    // Always refresh to ensure list is full and pagination info is correct
    const targetPage = (noticeStore.currentNotices.length === 0 && noticeStore.currentPage > 0)
      ? noticeStore.currentPage - 1
      : noticeStore.currentPage;
    
    await handlePageChange(targetPage, true);
  } catch (error: any) {
    // Handled by store
  }
};

onMounted(async () => {
  if (!auth.user) {
    await auth.fetchCurrentUser();
  }
  await noticeStore.fetchNotices();
  systemStore.fetchReactionTypes();
  fetchReactions();
  fetchAuthorProfiles();
});
</script>