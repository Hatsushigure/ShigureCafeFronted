<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <!-- Backdrop -->
        <transition enter-active-class="ease-out duration-200" enter-from-class="opacity-0" enter-to-class="opacity-100"
          leave-active-class="ease-in duration-150" leave-from-class="opacity-100" leave-to-class="opacity-0" appear>
          <div class="fixed inset-0 bg-black/20 backdrop-blur-md" aria-hidden="true" @click="$emit('close')"></div>
        </transition>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <!-- Modal Content -->
        <transition enter-active-class="ease-out duration-300"
          enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          enter-to-class="opacity-100 translate-y-0 sm:scale-100" leave-active-class="ease-in duration-200"
          leave-from-class="opacity-100 translate-y-0 sm:scale-100"
          leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" appear>
          <div
            class="relative inline-block align-middle bg-white rounded-2xl text-left shadow-xl transform transition-all w-full sm:my-8 sm:align-middle"
            :class="maxWidthClass">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 rounded-t-2xl" :class="{ 'rounded-b-2xl': !$slots.footer }">
              <h3 v-if="title" class="text-xl leading-6 font-bold text-gray-900 mb-4">{{ title }}</h3>
              <slot></slot>
            </div>
            <div v-if="$slots.footer" class="bg-gray-50 px-4 py-3 sm:px-6 flex flex-row-reverse gap-3 rounded-b-2xl">
              <slot name="footer"></slot>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  show: boolean;
  title?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  maxWidth: 'xl'
});

defineEmits(['close']);

const maxWidthClass = computed(() => {
  return {
    'sm': 'sm:max-w-sm',
    'md': 'sm:max-w-md',
    'lg': 'sm:max-w-lg',
    'xl': 'sm:max-w-xl',
    '2xl': 'sm:max-w-2xl',
  }[props.maxWidth];
});
</script>
