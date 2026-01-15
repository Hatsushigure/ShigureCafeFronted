<template>
  <div 
    :class="[
      avatarColor, 
      sizeClass,
      'rounded-full flex items-center justify-center text-white font-bold shadow-sm border-2 border-white ring-2 ring-gray-50 flex-shrink-0 transition-transform duration-200 hover:scale-105',
      customClass
    ]"
    :title="name"
  >
    {{ initial }}
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  customClass?: string;
}>(), {
  name: '?',
  size: 'md',
  customClass: ''
});

const initial = computed(() => {
  return props.name.charAt(0).toUpperCase();
});

const sizeClass = computed(() => {
  switch (props.size) {
    case 'xs': return 'h-6 w-6 text-[10px]';
    case 'sm': return 'h-8 w-8 text-xs';
    case 'lg': return 'h-12 w-12 text-lg';
    case 'xl': return 'h-16 w-16 text-xl';
    case '2xl': return 'h-24 w-24 text-4xl';
    case 'md':
    default: return 'h-9 w-9 text-sm';
  }
});

const avatarColor = computed(() => {
  const name = props.name;
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500',
    'bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-teal-500',
    'bg-orange-500', 'bg-cyan-500'
  ];
  return colors[Math.abs(hash) % colors.length];
});
</script>
