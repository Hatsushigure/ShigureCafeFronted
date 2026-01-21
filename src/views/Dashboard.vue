<template>
  <div class="min-h-screen bg-gray-50">
    <NavBar />

    <div v-if="pageLoading" class="flex items-center justify-center min-h-[calc(100vh-64px)]">
      <div class="flex flex-col items-center space-y-4">
        <Loader2 class="h-12 w-12 animate-spin text-indigo-600" />
        <p class="text-gray-500 font-medium animate-pulse">{{ t('dashboard.loading') }}</p>
      </div>
    </div>

    <div v-else class="py-10">
      <PageHeader>
        <template #title>
          <i18n-t keypath="dashboard.welcome" tag="span">
            <template #name>
              <span class="text-indigo-600">{{ auth.user?.nickname || auth.user?.username || t('dashboard.default-user')
                }}</span>
            </template>
          </i18n-t>
        </template>
        <template #actions>
          <p class="text-sm text-gray-500">{{ t('dashboard.today', { date: new Date().toLocaleDateString() }) }}</p>
        </template>
      </PageHeader>

      <PageContainer>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          <!-- Quick Action Cards -->
          <div class="animate-slide-up animate-delay-100">
            <BaseCard @click="$router.push('/profile')" hoverable body-class="p-6" class="h-full">
              <div class="flex items-center">
                <div class="flex-shrink-0 bg-blue-100 rounded-md p-3 group-hover:bg-blue-200 transition-colors">
                  <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div class="ml-4">
                  <h3 class="text-lg font-medium text-gray-900">{{ t('dashboard.personal-info.title') }}</h3>
                  <p class="mt-1 text-sm text-gray-500">{{ t('dashboard.personal-info.desc') }}</p>
                </div>
              </div>
              <template #footer>
                <div class="text-sm">
                  <span class="font-medium text-blue-600 group-hover:text-blue-500 transition-colors">{{
                    t('dashboard.personal-info.link') }} &rarr;</span>
                </div>
              </template>
            </BaseCard>
          </div>

          <div class="animate-slide-up animate-delay-150">
            <BaseCard @click="$router.push('/security')" hoverable body-class="p-6" class="h-full">
              <div class="flex items-center">
                <div class="flex-shrink-0 bg-green-100 rounded-md p-3 group-hover:bg-green-200 transition-colors">
                  <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div class="ml-4">
                  <h3 class="text-lg font-medium text-gray-900">{{ t('dashboard.security.title') }}</h3>
                  <p class="mt-1 text-sm text-gray-500">{{ t('dashboard.security.desc') }}</p>
                </div>
              </div>
              <template #footer>
                <div class="text-sm">
                  <span class="font-medium text-green-600 group-hover:text-green-500 transition-colors">{{
                    t('dashboard.security.link') }} &rarr;</span>
                </div>
              </template>
            </BaseCard>
          </div>

          <!-- Admin Cards -->
          <div v-if="auth.user?.role === 'ADMIN'" class="animate-slide-up animate-delay-200">
            <BaseCard @click="$router.push('/admin/users')" hoverable body-class="p-6" class="h-full">
              <div class="flex items-center">
                <div class="flex-shrink-0 bg-purple-100 rounded-md p-3 group-hover:bg-purple-200 transition-colors">
                  <svg class="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div class="ml-4">
                  <h3 class="text-lg font-medium text-gray-900">{{ t('dashboard.user-management.title') }}</h3>
                  <p class="mt-1 text-sm text-gray-500">{{ t('dashboard.user-management.desc') }}</p>
                </div>
              </div>
              <template #footer>
                <div class="text-sm">
                  <span class="font-medium text-purple-600 group-hover:text-purple-500 transition-colors">{{
                    t('dashboard.user-management.link') }} &rarr;</span>
                </div>
              </template>
            </BaseCard>
          </div>

          <div v-if="auth.user?.role === 'ADMIN'" class="animate-slide-up animate-delay-250">
            <BaseCard @click="$router.push('/admin/audits')" hoverable body-class="p-6" class="h-full">
              <div class="flex items-center">
                <div class="flex-shrink-0 bg-orange-100 rounded-md p-3 group-hover:bg-orange-200 transition-colors">
                  <svg class="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div class="ml-4">
                  <h3 class="text-lg font-medium text-gray-900">{{ t('dashboard.audit-management.title') }}</h3>
                  <p class="mt-1 text-sm text-gray-500">{{ t('dashboard.audit-management.desc') }}</p>
                </div>
              </div>
              <template #footer>
                <div class="text-sm">
                  <span class="font-medium text-orange-600 group-hover:text-orange-500 transition-colors">{{
                    t('dashboard.audit-management.link') }} &rarr;</span>
                </div>
              </template>
            </BaseCard>
          </div>

          <div v-if="auth.user?.role === 'ADMIN'" class="animate-slide-up animate-delay-300">
            <BaseCard @click="$router.push('/notices')" hoverable body-class="p-6" class="h-full">
              <div class="flex items-center">
                <div class="flex-shrink-0 bg-pink-100 rounded-md p-3 group-hover:bg-pink-200 transition-colors">
                  <svg class="h-6 w-6 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                </div>
                <div class="ml-4">
                  <h3 class="text-lg font-medium text-gray-900">{{ t('dashboard.notice-management.title') }}</h3>
                  <p class="mt-1 text-sm text-gray-500">{{ t('dashboard.notice-management.desc') }}</p>
                </div>
              </div>
              <template #footer>
                <div class="text-sm">
                  <span class="font-medium text-pink-600 group-hover:text-pink-500 transition-colors">{{
                    t('dashboard.notice-management.link') }} &rarr;</span>
                </div>
              </template>
            </BaseCard>
          </div>

        </div>

        <!-- Recent Activity -->
        <div class="mt-12 px-4 sm:px-0">
          <div class="flex justify-between items-center mb-4 animate-slide-up" :class="noticeDelayBase">
            <h2 class="text-lg font-medium text-gray-900">{{ t('dashboard.system-notices') }}</h2>
            <router-link to="/notices"
              class="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center transition-colors">
              {{ t('dashboard.view-all') }}
              <ChevronRight class="h-4 w-4 ml-1" />
            </router-link>
          </div>

          <div v-if="noticeStore.loading && noticeStore.currentNotices.length === 0"
            class="bg-white shadow rounded-2xl p-12 flex justify-center items-center text-gray-400 animate-slide-up"
            :class="getNoticeDelay(0)">
            <Loader2 class="h-8 w-8 animate-spin" />
          </div>
          <div v-else-if="displayedNotices.length === 0"
            class="bg-white shadow rounded-2xl p-12 text-center text-gray-500 animate-slide-up"
            :class="getNoticeDelay(0)">
            <p>{{ t('notices.no-notices') }}</p>
          </div>
          <div v-else class="space-y-4">
            <div v-for="(notice, index) in displayedNotices" :key="notice.id" class="animate-slide-up"
              :class="getNoticeDelay(index)">
              <NoticeCard :notice="notice" compact :is-admin="auth.user?.role === 'ADMIN'"
                @click="$router.push(`/notices/${notice.id}`)"
                @edit="$router.push(`/admin/notices/${notice.id}/edit?redirect=/dashboard`)"
                @read="$router.push(`/notices/${notice.id}`)" />
            </div>
          </div>
        </div>

      </PageContainer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '../stores/auth';
import { useNoticeStore } from '../stores/notice';
import { useSystemStore } from '../stores/system';
import NavBar from '../components/NavBar.vue';
import PageHeader from '../components/PageHeader.vue';
import PageContainer from '../components/PageContainer.vue';
import BaseCard from '../components/BaseCard.vue';
import NoticeCard from '../components/NoticeCard.vue';
import { Loader2, ChevronRight } from 'lucide-vue-next';

const { t } = useI18n();
const auth = useAuthStore();
const noticeStore = useNoticeStore();
const systemStore = useSystemStore();
const pageLoading = ref(true);

const displayedNotices = computed(() => {
  const notices = noticeStore.currentNotices;
  const pinned = notices.filter(n => n.pinned);
  const unpinned = notices.filter(n => !n.pinned).slice(0, 3);
  return [...pinned, ...unpinned];
});

const noticeDelayBase = computed(() => {
  return auth.user?.role === 'ADMIN' ? 'animate-delay-200' : 'animate-delay-100';
});

const getNoticeDelay = (index: number) => {
  const base = auth.user?.role === 'ADMIN' ? 250 : 150;
  return `animate-delay-${base + index * 50}`;
};

onMounted(async () => {
  try {
    if (!auth.user) {
      await auth.fetchCurrentUser();
    }
    // Fetch system configs
    systemStore.fetchReactionTypes();
  } catch (error) {
    // Handled by auth store
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