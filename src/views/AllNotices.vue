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
              所有公告
            </h1>
          </div>
          <div class="text-sm text-gray-500 animate-slide-up animate-delay-50">
            共 {{ noticeStore.notices.length }} 条公告
          </div>
        </div>
      </header>
      <main>
        <div class="max-w-4xl mx-auto sm:px-6 lg:px-8 mt-8">
          <div class="px-4 sm:px-0 animate-slide-up animate-delay-100">
             <div v-if="noticeStore.loading && noticeStore.notices.length === 0" class="bg-white shadow rounded-2xl p-12 flex justify-center items-center text-gray-400">
                <Loader2 class="h-8 w-8 animate-spin" />
             </div>
             <div v-else-if="noticeStore.notices.length === 0" class="bg-white shadow rounded-2xl p-12 text-center text-gray-500">
                <p>暂无公告</p>
             </div>
             <div v-else class="space-y-6">
                <div v-for="(notice, index) in noticeStore.notices" :key="notice.id"
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
                          <span class="text-sm text-gray-400">{{ new Date(notice.createdAt).toLocaleString() }}</span>
                        </div>
                        <div class="mt-4 prose prose-slate max-w-none text-gray-600 line-clamp-3 overflow-hidden" v-html="renderMarkdown(notice.content)"></div>
                        <div class="mt-6 flex items-center justify-between border-t border-gray-50 pt-4">
                           <div class="flex items-center text-sm text-gray-500">
                             <span class="font-medium text-gray-900 mr-2">{{ notice.authorNickname }}</span>
                             <span v-if="notice.updatedAt !== notice.createdAt" class="italic"> (已编辑)</span>
                           </div>
                           <div class="flex items-center space-x-4">
                             <button v-if="auth.user?.role === 'ADMIN'" @click="$router.push(`/admin/notices/${notice.id}/edit`)" class="text-sm font-bold text-gray-500 hover:text-indigo-600 transition-colors flex items-center">
                               <Edit2 class="h-4 w-4 mr-1" />
                               编辑
                             </button>
                             <button @click="$router.push(`/notices/${notice.id}`)" class="text-sm font-bold text-indigo-600 hover:text-indigo-500 transition-colors flex items-center">
                               阅读全文
                               <ChevronRight class="h-4 w-4 ml-1" />
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
import { onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useNoticeStore } from '../stores/notice';
import NavBar from '../components/NavBar.vue';
import BaseCard from '../components/BaseCard.vue';
import { Loader2, ArrowLeft, ChevronRight, Edit2 } from 'lucide-vue-next';
import { marked } from 'marked';

const auth = useAuthStore();
const noticeStore = useNoticeStore();

const renderMarkdown = (content: string) => {
  return marked.parse(content);
};

onMounted(async () => {
  if (!auth.user) {
    await auth.fetchCurrentUser();
  }
  noticeStore.fetchNotices();
});
</script>