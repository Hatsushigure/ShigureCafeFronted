<template>
  <header>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
      <h1 v-if="!isSearchExpanded"
        class="text-2xl sm:text-3xl font-extrabold leading-tight text-gray-900 tracking-tight animate-slide-up">
        {{ title }}
      </h1>

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
          <div class="relative transition-all duration-300 ease-in-out animate-slide-up animate-delay-50" :class="[
            isSearchExpanded ? 'w-full opacity-100' : 'hidden sm:block sm:w-64 opacity-100'
          ]">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search class="h-4 w-4 text-gray-400" />
            </div>
            <input :value="modelValue" @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
              ref="searchInput" type="text" :placeholder="searchPlaceholder"
              class="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:border-blue-500 sm:text-sm transition-all duration-200"
              @keyup.esc="isSearchExpanded = false" />
            <!-- Mobile Close button -->
            <button v-if="isSearchExpanded" @click="isSearchExpanded = false"
              class="sm:hidden absolute inset-y-0 right-0 pr-3 flex items-center">
              <X class="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </button>
          </div>
        </div>

        <!-- Refresh Button -->
        <BaseButton v-show="!isSearchExpanded" variant="secondary" @click="$emit('refresh')" :loading="loading"
          hide-loading-text-on-mobile
          class="animate-slide-up animate-delay-50">
          <RotateCw v-if="!loading" class="h-4 w-4 sm:mr-2" />
          <span class="hidden sm:inline">{{ t('common.refresh-list') }}</span>
        </BaseButton>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { Search, X, RotateCw } from 'lucide-vue-next';
import BaseButton from './BaseButton.vue';

const { t } = useI18n();

const props = defineProps<{
  title: string;
  modelValue: string;
  loading?: boolean;
  searchPlaceholder?: string;
}>();

defineEmits(['update:modelValue', 'refresh']);

const isSearchExpanded = ref(false);
const searchInput = ref<HTMLInputElement | null>(null);

watch(isSearchExpanded, (val) => {
  if (val) {
    nextTick(() => {
      searchInput.value?.focus();
    });
  }
});
</script>
