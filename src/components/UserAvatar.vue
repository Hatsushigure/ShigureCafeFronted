<template>
  <div 
    :class="[
      !displaySrc ? avatarColor : 'bg-gray-100', 
      sizeClass,
      'rounded-full flex items-center justify-center text-white font-bold shadow-sm border-2 border-white ring-2 ring-gray-50 flex-shrink-0 transition-transform duration-200 hover:scale-105 overflow-hidden',
      customClass
    ]"
    :title="name"
  >
    <img v-if="displaySrc" :src="displaySrc" class="h-full w-full object-cover" :alt="name" />
    <span v-else>{{ initial }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onUnmounted } from 'vue';
import { getCachedAvatar, cacheAvatar } from '../utils/avatarCache';

const props = withDefaults(defineProps<{
  name?: string;
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  customClass?: string;
}>(), {
  name: '?',
  size: 'md',
  customClass: ''
});

const displaySrc = ref<string | undefined>(undefined);
let currentObjectUrl: string | null = null;

const cleanup = () => {
  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = null;
  }
};

const loadAvatar = async () => {
  const targetSrc = props.src;
  
  if (!targetSrc) {
    cleanup();
    displaySrc.value = undefined;
    return;
  }

  // If it's already a special URL (data or blob), just use it
  if (targetSrc.startsWith('data:') || targetSrc.startsWith('blob:')) {
    cleanup();
    displaySrc.value = targetSrc;
    return;
  }

  // Try to get from cache
  const cachedUrl = await getCachedAvatar(targetSrc);
  
  // Check if props.src changed while we were checking the cache
  if (props.src !== targetSrc) {
    if (cachedUrl) URL.revokeObjectURL(cachedUrl);
    return;
  }

  if (cachedUrl) {
    cleanup();
    currentObjectUrl = cachedUrl;
    displaySrc.value = cachedUrl;
    return;
  }

  // Not in cache, fetch and store
  try {
    const response = await fetch(targetSrc);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const blob = await response.blob();
    
    // Only proceed if the src hasn't changed while we were fetching
    if (props.src === targetSrc) {
      await cacheAvatar(targetSrc, blob);
      const newUrl = URL.createObjectURL(blob);
      cleanup();
      currentObjectUrl = newUrl;
      displaySrc.value = newUrl;
    }
  } catch (e) {
    console.error('Failed to load/cache avatar:', e);
    // Fallback to original URL if fetch fails
    if (props.src === targetSrc) {
      cleanup();
      displaySrc.value = targetSrc;
    }
  }
};

watch(() => props.src, loadAvatar, { immediate: true });

onUnmounted(() => {
  cleanup();
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
