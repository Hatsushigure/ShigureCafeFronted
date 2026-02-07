<template>
  <router-view v-slot="{ Component }">
    <transition name="fade-slide" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
  <ToastContainer />
  <BackToTop />
  <Turnstile />
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from './stores/auth';
import ToastContainer from './components/ToastContainer.vue';
import BackToTop from './components/BackToTop.vue';
import Turnstile from './components/Turnstile.vue';

const authStore = useAuthStore();
const route = useRoute();

// Handle session validation on route change
watch(
  () => route.meta.requiresAuth,
  async (requiresAuth) => {
    if (requiresAuth) {
      await authStore.performSessionCheck();
    }
  },
  { immediate: true }
);
</script>
