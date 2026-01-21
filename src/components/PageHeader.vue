<template>
  <header>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:justify-between md:items-center">
      <div>
        <h1 class="text-3xl font-extrabold leading-tight text-gray-900 tracking-tight animate-slide-up">
          <slot name="title">{{ title }}</slot>
        </h1>
        <p v-if="subtitle || $slots.subtitle" class="text-sm text-gray-500 mt-1 animate-slide-up animate-delay-50">
          <slot name="subtitle">{{ subtitle }}</slot>
        </p>
      </div>
      <div v-if="$slots.actions" class="mt-4 md:mt-0 flex items-center space-x-4 animate-slide-up animate-delay-100">
        <slot name="actions"></slot>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
interface Props {
  title?: string;
  subtitle?: string;
}

defineProps<Props>();
</script>
