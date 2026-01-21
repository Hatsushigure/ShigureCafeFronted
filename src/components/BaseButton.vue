<template>
  <button :type="type" :disabled="disabled || loading" :class="[
    'btn group',
    variant === 'primary' ? 'btn-primary' :
      variant === 'secondary' ? 'btn-secondary' :
        variant === 'danger' ? 'btn-danger' :
          variant === 'warning' ? 'btn-warning' :
            variant === 'ghost' ? 'btn-ghost' :
              variant === 'outline' ? 'btn-outline' : 'btn-primary',
    fullWidth ? 'w-full' : ''
  ]" @click="$emit('click', $event)">
    <svg v-if="loading" class="animate-spin -ml-1 h-5 w-5" :class="[
      (loadingText || t('common.processing')) ? (hideLoadingTextOnMobile ? 'sm:mr-2' : 'mr-2') : '',
      variant === 'primary' ? 'text-white' :
        variant === 'danger' ? 'text-red-600' :
          variant === 'warning' ? 'text-yellow-600' :
            'text-blue-600'
    ]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
      </path>
    </svg>
    <template v-if="loading">
      <span :class="{ 'hidden sm:inline': hideLoadingTextOnMobile }">
        {{ loadingText || t('common.processing') }}
      </span>
    </template>
    <slot v-else>
      {{ label }}
    </slot>
  </button>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

interface Props {
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger' | 'warning' | 'ghost' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  hideLoadingTextOnMobile?: boolean;
  label?: string;
  fullWidth?: boolean;
}

withDefaults(defineProps<Props>(), {
  type: 'button',
  variant: 'primary',
  disabled: false,
  loading: false,
  loadingText: '',
  hideLoadingTextOnMobile: false,
  label: '',
  fullWidth: false
});

defineEmits(['click']);
</script>