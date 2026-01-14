<template>
  <div class="flex items-center justify-between px-4 py-3 sm:px-6">
    <div class="flex flex-1 items-center justify-between sm:hidden">
      <button
        @click="$emit('page-change', currentPage - 1)"
        :disabled="currentPage === 0"
        class="relative inline-flex items-center rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:text-gray-400 transition-colors"
      >
        <ChevronLeft class="h-4 w-4 mr-1" />
        上一页
      </button>

      <div class="flex items-center space-x-2">
        <input
          v-model="jumpPageInput"
          type="text"
          inputmode="numeric"
          pattern="[0-9]*"
          class="w-10 px-1 py-1.5 text-sm text-center border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-all"
          @keyup.enter="handleJump"
          @blur="jumpPageInput = (currentPage + 1).toString()"
        />
        <span class="text-xs font-medium text-gray-500">/ {{ totalPages }}</span>
      </div>

      <button
        @click="$emit('page-change', currentPage + 1)"
        :disabled="currentPage >= totalPages - 1"
        class="relative inline-flex items-center rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:text-gray-400 transition-colors"
      >
        下一页
        <ChevronRight class="h-4 w-4 ml-1" />
      </button>
    </div>
    <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
      <div>
        <p class="text-sm text-gray-700">
          显示第
          <span class="font-medium">{{ totalElements > 0 ? currentPage * pageSize + 1 : 0 }}</span>
          至
          <span class="font-medium">{{ Math.min((currentPage + 1) * pageSize, totalElements) }}</span>
          条，共
          <span class="font-medium">{{ totalElements }}</span>
          条结果
        </p>
      </div>
      <div class="flex items-center space-x-4">
        <!-- Jump to Page -->
        <div class="flex items-center space-x-2 mr-2">
          <span class="text-sm text-gray-500">跳转至</span>
          <div class="relative">
            <input
              v-model="jumpPageInput"
              type="text"
              class="w-12 px-2 py-1 text-sm text-center border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
              @keyup.enter="handleJump"
              @blur="jumpPageInput = (currentPage + 1).toString()"
            />
          </div>
          <span class="text-sm text-gray-500">/ {{ totalPages }} 页</span>
          <button 
            @mousedown.prevent
            @click="handleJump"
            class="p-1 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="跳转"
          >
            <ArrowRight class="h-4 w-4" />
          </button>
        </div>

        <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
          <button
            @click="$emit('page-change', currentPage - 1)"
            :disabled="currentPage === 0"
            class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span class="sr-only">Previous</span>
            <ChevronLeft class="h-5 w-5" aria-hidden="true" />
          </button>
          
          <template v-for="page in displayedPages" :key="page">
            <button
              v-if="page !== -1"
              @click="$emit('page-change', page)"
              :class="[
                page === currentPage
                  ? 'relative z-10 inline-flex items-center bg-blue-600 px-4 py-2 text-sm font-semibold text-white focus:z-20'
                  : 'relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
              ]"
            >
              {{ page + 1 }}
            </button>
            <span
              v-else
              class="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0"
            >
              ...
            </span>
          </template>

          <button
            @click="$emit('page-change', currentPage + 1)"
            :disabled="currentPage >= totalPages - 1"
            class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span class="sr-only">Next</span>
            <ChevronRight class="h-5 w-5" aria-hidden="true" />
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-vue-next';
import BaseButton from './BaseButton.vue';

const props = defineProps<{
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
}>();

const emit = defineEmits(['page-change']);

const jumpPageInput = ref((props.currentPage + 1).toString());

watch(() => props.currentPage, (newVal) => {
  jumpPageInput.value = (newVal + 1).toString();
});

const handleJump = () => {
  const page = parseInt(jumpPageInput.value);
  if (!isNaN(page) && page >= 1 && page <= props.totalPages) {
    emit('page-change', page - 1);
  } else {
    jumpPageInput.value = (props.currentPage + 1).toString();
  }
};

const displayedPages = computed(() => {
  const pages: number[] = [];
  const total = props.totalPages;
  const current = props.currentPage;

  if (total <= 7) {
    for (let i = 0; i < total; i++) pages.push(i);
  } else {
    pages.push(0);
    if (current > 3) pages.push(-1);

    const start = Math.max(1, current - 1);
    const end = Math.min(total - 2, current + 1);

    for (let i = start; i <= end; i++) {
      if (!pages.includes(i)) pages.push(i);
    }

    if (current < total - 4) pages.push(-1);
    if (!pages.includes(total - 1)) pages.push(total - 1);
  }
  return pages;
});
</script>
