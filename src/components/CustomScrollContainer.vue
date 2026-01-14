<template>
  <div 
    class="relative group/scroll w-full"
    @mouseenter="showScrollbar = true"
    @mouseleave="isDragging ? null : (showScrollbar = false)"
  >
    <!-- Content Container -->
    <div 
      ref="containerRef"
      class="w-full overflow-x-auto scrollbar-none pb-4"
      style="scrollbar-width: none; -ms-overflow-style: none;"
      @scroll="handleScroll"
    >
      <div ref="contentRef" class="min-w-max">
        <slot></slot>
      </div>
    </div>

    <!-- Custom Scrollbar Track -->
    <div 
      v-if="hasScroll"
      class="absolute bottom-1 left-2 right-2 h-2.5 bg-gray-200/40 backdrop-blur-sm transition-opacity duration-300 rounded-full z-20"
      :class="[
        (showScrollbar || isDragging) ? 'opacity-100' : 'opacity-0'
      ]"
      @mousedown.stop="handleTrackClick"
    >
      <!-- Custom Scrollbar Thumb -->
      <div 
        class="absolute top-0.5 h-1.5 rounded-full transition-colors cursor-pointer"
        :class="[
          isDragging ? 'bg-indigo-500/80' : 'bg-gray-400/80 hover:bg-indigo-500/80'
        ]"
        :style="{
          width: thumbWidth + 'px',
          transform: `translateX(${thumbOffset}px)`
        }"
        @mousedown.stop.prevent="startDrag"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const containerRef = ref<HTMLElement | null>(null);
const contentRef = ref<HTMLElement | null>(null);
const showScrollbar = ref(false);
const isDragging = ref(false);
const hasScroll = ref(false);

const thumbWidth = ref(0);
const thumbOffset = ref(0);

let startX = 0;
let startOffset = 0;

const updateScrollbarMetrics = () => {
  if (!containerRef.value || !contentRef.value) return;
  
  const clientWidth = containerRef.value.clientWidth;
  const scrollWidth = containerRef.value.scrollWidth;
  const scrollLeft = containerRef.value.scrollLeft;
  
  hasScroll.value = scrollWidth > clientWidth + 1; // +1 to avoid rounding issues
  
  if (hasScroll.value) {
    // track width is clientWidth - 16px (left-2 right-2)
    const trackWidth = clientWidth - 16;
    thumbWidth.value = Math.max((clientWidth / scrollWidth) * trackWidth, 40);
    const maxScrollLeft = scrollWidth - clientWidth;
    const maxThumbOffset = trackWidth - thumbWidth.value;
    thumbOffset.value = (scrollLeft / maxScrollLeft) * maxThumbOffset;
  }
};

const handleScroll = () => {
  if (!isDragging.value) {
    updateScrollbarMetrics();
  }
};

const startDrag = (e: MouseEvent) => {
  isDragging.value = true;
  startX = e.clientX;
  startOffset = thumbOffset.value;
  
  document.addEventListener('mousemove', handleDrag);
  document.addEventListener('mouseup', stopDrag);
  document.body.style.userSelect = 'none';
};

const handleDrag = (e: MouseEvent) => {
  if (!isDragging.value || !containerRef.value) return;
  
  const deltaX = e.clientX - startX;
  const clientWidth = containerRef.value.clientWidth;
  const scrollWidth = containerRef.value.scrollWidth;
  const trackWidth = clientWidth - 16;
  const maxThumbOffset = trackWidth - thumbWidth.value;
  const maxScrollLeft = scrollWidth - clientWidth;
  
  let newOffset = startOffset + deltaX;
  newOffset = Math.max(0, Math.min(newOffset, maxThumbOffset));
  
  thumbOffset.value = newOffset;
  containerRef.value.scrollLeft = (newOffset / maxThumbOffset) * maxScrollLeft;
};

const stopDrag = () => {
  isDragging.value = false;
  document.removeEventListener('mousemove', handleDrag);
  document.removeEventListener('mouseup', stopDrag);
  document.body.style.userSelect = '';
  
  if (!containerRef.value?.parentElement?.matches(':hover')) {
    showScrollbar.value = false;
  }
};

const handleTrackClick = (e: MouseEvent) => {
  if (!containerRef.value) return;
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const trackWidth = rect.width;
  const targetOffset = clickX - thumbWidth.value / 2;
  
  const { scrollWidth, clientWidth } = containerRef.value;
  const maxThumbOffset = trackWidth - thumbWidth.value;
  const maxScrollLeft = scrollWidth - clientWidth;
  
  const newOffset = Math.max(0, Math.min(targetOffset, maxThumbOffset));
  containerRef.value.scrollTo({
    left: (newOffset / maxThumbOffset) * maxScrollLeft,
    behavior: 'smooth'
  });
};

const resizeObserver = new ResizeObserver(() => {
  updateScrollbarMetrics();
});

onMounted(() => {
  if (containerRef.value) {
    resizeObserver.observe(containerRef.value);
  }
  if (contentRef.value) {
    resizeObserver.observe(contentRef.value);
  }
  // Delayed update to ensure content is fully rendered
  setTimeout(updateScrollbarMetrics, 100);
});

onUnmounted(() => {
  resizeObserver.disconnect();
});

defineExpose({ update: updateScrollbarMetrics });
</script>

<style scoped>
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
</style>
