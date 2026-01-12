<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'group relative flex items-center justify-center py-3 px-4 border text-sm font-bold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]',
      variant === 'primary' 
        ? 'text-white border-transparent bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:ring-indigo-500 shadow-lg hover:shadow-xl' 
        : variant === 'secondary'
        ? 'text-blue-600 border-blue-200 bg-blue-50/50 hover:bg-blue-100 hover:border-blue-300 focus:ring-blue-500 shadow-sm'
        : variant === 'danger'
        ? 'text-red-700 border-red-200 bg-red-50 hover:bg-red-100 hover:border-red-300 focus:ring-red-500 shadow-sm'
        : variant === 'warning'
        ? 'text-yellow-700 border-yellow-200 bg-yellow-50 hover:bg-yellow-100 hover:border-yellow-300 focus:ring-yellow-500 shadow-sm'
        : variant === 'ghost'
        ? 'text-gray-500 border-transparent bg-transparent hover:bg-gray-100 hover:text-gray-700 focus:ring-gray-500'
        : variant === 'outline'
        ? 'text-gray-700 border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 shadow-sm focus:ring-blue-500'
        : 'text-white border-transparent bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:ring-indigo-500 shadow-lg hover:shadow-xl',
      fullWidth ? 'w-full' : ''
    ]"
    @click="$emit('click', $event)"
  >
    <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-5 w-5" :class="variant === 'primary' ? 'text-white' : 'text-blue-600'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <slot>
      {{ loading ? loadingText : label }}
    </slot>
  </button>
</template>

<script setup lang="ts">
interface Props {
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger' | 'warning' | 'ghost' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  label?: string;
  fullWidth?: boolean;
}

withDefaults(defineProps<Props>(), {
  type: 'button',
  variant: 'primary',
  disabled: false,
  loading: false,
  loadingText: '处理中...',
  label: '',
  fullWidth: false
});

defineEmits(['click']);
</script>