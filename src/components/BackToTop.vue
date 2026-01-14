<template>
  <Transition name="fade">
    <button
      v-show="isVisible"
      @click="scrollToTop"
      class="fixed bottom-8 right-8 p-3 rounded-full bg-white shadow-lg border border-gray-100 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 transition-all duration-300 z-40 group focus:outline-none"
      aria-label="回到顶部"
    >
      <ChevronUp class="h-6 w-6 group-hover:-translate-y-1 transition-transform duration-300" />
    </button>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { ChevronUp } from 'lucide-vue-next';

const isVisible = ref(false);

const checkScroll = () => {
  // 当滚动超过 400 像素时显示按钮
  isVisible.value = window.scrollY > 400;
};

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

onMounted(() => {
  window.addEventListener('scroll', checkScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', checkScroll);
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
