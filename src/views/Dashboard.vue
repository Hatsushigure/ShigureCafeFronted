<template>
  <div class="min-h-screen bg-gray-50">
    <NavBar />

    <div v-if="pageLoading" class="flex items-center justify-center min-h-[calc(100vh-64px)]">
      <div class="flex flex-col items-center space-y-4">
        <Loader2 class="h-12 w-12 animate-spin text-indigo-600" />
        <p class="text-gray-500 font-medium animate-pulse">正在加载您的空间...</p>
      </div>
    </div>

    <div v-else class="py-10">
      <header>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 class="text-3xl font-extrabold leading-tight text-gray-900 tracking-tight animate-slide-up">
            欢迎回来, <span class="text-indigo-600">{{ auth.user?.nickname || auth.user?.username || '用户' }}</span>
          </h1>
            <p class="text-sm text-gray-500 mt-1">今天是 {{ new Date().toLocaleDateString() }}</p>
        </div>
      </header>
      <main>
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8 mt-8">
          <div class="px-4 sm:px-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <!-- Quick Action Cards -->
            <div class="animate-slide-up animate-delay-100">
              <BaseCard 
                @click="$router.push('/profile')" 
                hoverable
                body-class="p-6"
                class="h-full"
              >
                <div class="flex items-center">
                  <div class="flex-shrink-0 bg-blue-100 rounded-md p-3 group-hover:bg-blue-200 transition-colors">
                    <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div class="ml-4">
                    <h3 class="text-lg font-medium text-gray-900">个人信息</h3>
                    <p class="mt-1 text-sm text-gray-500">查看和编辑您的个人资料</p>
                  </div>
                </div>
                <template #footer>
                  <div class="text-sm">
                    <span class="font-medium text-blue-600 group-hover:text-blue-500 transition-colors">前往查看 &rarr;</span>
                  </div>
                </template>
              </BaseCard>
            </div>

            <div class="animate-slide-up animate-delay-150">
              <BaseCard 
                @click="$router.push('/security')" 
                hoverable
                body-class="p-6"
                class="h-full"
              >
                <div class="flex items-center">
                  <div class="flex-shrink-0 bg-green-100 rounded-md p-3 group-hover:bg-green-200 transition-colors">
                    <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div class="ml-4">
                    <h3 class="text-lg font-medium text-gray-900">安全设置</h3>
                    <p class="mt-1 text-sm text-gray-500">修改密码或更新邮箱</p>
                  </div>
                </div>
                <template #footer>
                  <div class="text-sm">
                    <span class="font-medium text-green-600 group-hover:text-green-500 transition-colors">前往设置 &rarr;</span>
                  </div>
                </template>
              </BaseCard>
            </div>

            <!-- Admin Cards -->
            <div v-if="auth.user?.role === 'ADMIN'" class="animate-slide-up animate-delay-200">
              <BaseCard 
                @click="$router.push('/admin/users')" 
                hoverable
                body-class="p-6"
                class="h-full"
              >
                <div class="flex items-center">
                  <div class="flex-shrink-0 bg-purple-100 rounded-md p-3 group-hover:bg-purple-200 transition-colors">
                    <svg class="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div class="ml-4">
                    <h3 class="text-lg font-medium text-gray-900">用户管理</h3>
                    <p class="mt-1 text-sm text-gray-500">管理系统用户和权限</p>
                  </div>
                </div>
                <template #footer>
                  <div class="text-sm">
                    <span class="font-medium text-purple-600 group-hover:text-purple-500 transition-colors">进入管理 &rarr;</span>
                  </div>
                </template>
              </BaseCard>
            </div>

            <div v-if="auth.user?.role === 'ADMIN'" class="animate-slide-up animate-delay-250">
              <BaseCard 
                @click="$router.push('/admin/audits')" 
                hoverable
                body-class="p-6"
                class="h-full"
              >
                <div class="flex items-center">
                  <div class="flex-shrink-0 bg-orange-100 rounded-md p-3 group-hover:bg-orange-200 transition-colors">
                    <svg class="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <div class="ml-4">
                    <h3 class="text-lg font-medium text-gray-900">审核管理</h3>
                    <p class="mt-1 text-sm text-gray-500">处理用户注册审核请求</p>
                  </div>
                </div>
                <template #footer>
                  <div class="text-sm">
                    <span class="font-medium text-orange-600 group-hover:text-orange-500 transition-colors">处理审核 &rarr;</span>
                  </div>
                </template>
              </BaseCard>
            </div>

            <div v-if="auth.user?.role === 'ADMIN'" class="animate-slide-up animate-delay-300">
              <BaseCard 
                @click="$router.push('/admin/notices')" 
                hoverable
                body-class="p-6"
                class="h-full"
              >
                <div class="flex items-center">
                  <div class="flex-shrink-0 bg-pink-100 rounded-md p-3 group-hover:bg-pink-200 transition-colors">
                    <svg class="h-6 w-6 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                  </div>
                  <div class="ml-4">
                    <h3 class="text-lg font-medium text-gray-900">公告管理</h3>
                    <p class="mt-1 text-sm text-gray-500">发布、编辑或删除系统公告</p>
                  </div>
                </div>
                <template #footer>
                  <div class="text-sm">
                    <span class="font-medium text-pink-600 group-hover:text-pink-500 transition-colors">进入管理 &rarr;</span>
                  </div>
                </template>
              </BaseCard>
            </div>

          </div>

          <!-- Recent Activity -->
          <div class="mt-12 px-4 sm:px-0">
             <div class="flex justify-between items-center mb-4 animate-slide-up" :class="noticeDelayBase">
               <h2 class="text-lg font-medium text-gray-900">系统公告</h2>
               <router-link to="/notices" class="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center transition-colors">
                 查看全部
                 <ChevronRight class="h-4 w-4 ml-1" />
               </router-link>
             </div>
             
             <div v-if="noticeStore.loading && noticeStore.currentNotices.length === 0" class="bg-white shadow rounded-2xl p-12 flex justify-center items-center text-gray-400 animate-slide-up" :class="getNoticeDelay(0)">
                <Loader2 class="h-8 w-8 animate-spin" />
             </div>
             <div v-else-if="displayedNotices.length === 0" class="bg-white shadow rounded-2xl p-12 text-center text-gray-500 animate-slide-up" :class="getNoticeDelay(0)">
                <p>暂无公告</p>
             </div>
             <div v-else class="space-y-4">
                <div v-for="(notice, index) in displayedNotices" :key="notice.id"
                  class="animate-slide-up"
                  :class="getNoticeDelay(index)"
                >
                  <BaseCard 
                    @click="$router.push(`/notices/${notice.id}`)"
                    hoverable
                    body-class="p-6"
                    :border="notice.pinned ? 'border-orange-200 bg-orange-50/30 ring-1 ring-orange-100' : 'border-gray-100'"
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
                            <h4 class="text-lg font-bold text-gray-900">{{ notice.title }}</h4>
                            <span v-if="notice.pinned" class="ml-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-700 rounded-md">
                              置顶
                            </span>
                          </div>
                          <span class="text-xs text-gray-400">{{ formatDateTime(notice.createdAt) }}</span>
                        </div>
                        <div class="mt-2 prose prose-sm prose-slate max-w-none text-gray-600 line-clamp-3 overflow-hidden" v-html="renderMarkdown(notice.content)"></div>
                        
                        <!-- Reaction Summary -->
                        <div v-if="noticeStore.getReactions(notice.id).length > 0" class="mt-2 flex flex-wrap items-center gap-1">
                          <span 
                            v-for="reaction in noticeStore.getReactions(notice.id).slice(0, 5)" 
                            :key="reaction.emoji"
                            class="inline-flex items-center space-x-1 text-[9px] font-bold text-gray-500 bg-gray-50 border border-gray-100 px-1.5 py-0 rounded-full"
                          >
                            <span>{{ reaction.emoji }}</span>
                            <span>{{ reaction.count }}</span>
                          </span>
                        </div>

                        <div class="mt-4 flex items-center justify-between">
                           <div class="flex items-center text-xs text-gray-500">
                              <span class="font-medium mr-2">{{ notice.authorNickname }}</span>
                              <span v-if="notice.updatedAt !== notice.createdAt" class="italic"> (已编辑于 {{ formatDateTime(notice.updatedAt) }})</span>
                           </div>
                           <div class="flex items-center space-x-3">
                             <button v-if="auth.user?.role === 'ADMIN'" @click="$router.push(`/admin/notices/${notice.id}/edit?redirect=/dashboard`)" class="text-xs font-bold text-gray-500 hover:text-indigo-600 transition-colors flex items-center">
                               <Edit2 class="h-3 w-3 mr-0.5" />
                               编辑
                             </button>
                             <button @click="$router.push(`/notices/${notice.id}`)" class="text-xs font-bold text-indigo-600 hover:text-indigo-500 transition-colors flex items-center">
                               阅读全文
                               <ChevronRight class="h-3 w-3 ml-0.5" />
                             </button>
                           </div>
                        </div>
                    </div>
                  </div>
                </BaseCard>
              </div>
             </div>
          </div>

        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useNoticeStore } from '../stores/notice';
import NavBar from '../components/NavBar.vue';
import BaseCard from '../components/BaseCard.vue';
import { Loader2, ChevronRight, Edit2 } from 'lucide-vue-next';
import { marked } from 'marked';
import { formatDateTime } from '../utils/formatters';

const auth = useAuthStore();
const noticeStore = useNoticeStore();
const pageLoading = ref(true);

const displayedNotices = computed(() => {
  const notices = noticeStore.currentNotices;
  const pinned = notices.filter(n => n.pinned);
  const unpinned = notices.filter(n => !n.pinned).slice(0, 3);
  return [...pinned, ...unpinned];
});

// Calculate the base delay for the notice section based on user role
const noticeDelayBase = computed(() => {
  // 2 base cards + (up to 3 admin cards)
  const cardCount = auth.user?.role === 'ADMIN' ? 5 : 2;
  const baseDelay = (cardCount + 2) * 50; // + header items (Title + Date)
  return `animate-delay-${baseDelay}`;
});

const getNoticeDelay = (index: number) => {
  const cardCount = auth.user?.role === 'ADMIN' ? 5 : 2;
  const headerCount = 2; // Title + Date
  const sectionHeaderCount = 1; 
  const totalPreceding = cardCount + headerCount + sectionHeaderCount;
  const itemDelay = (totalPreceding + index) * 50;
  return `animate-delay-${itemDelay}`;
};

const renderMarkdown = (content: string) => {
  return marked.parse(content);
};

onMounted(async () => {
  try {
    if (!auth.user) {
      await auth.fetchCurrentUser();
    }
  } catch (error) {
    console.error('Failed to fetch user', error);
  } finally {
    pageLoading.value = false;
    await noticeStore.fetchNotices();
    // Fetch reactions for displayed notices
    const ids = displayedNotices.value.map(n => n.id);
    if (ids.length > 0) {
        noticeStore.fetchReactionsForList(ids);
    }
  }
});
</script>