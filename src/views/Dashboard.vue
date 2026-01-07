<template>
  <div class="min-h-screen bg-gray-100">
    <NavBar />

    <div class="py-10">
      <header>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 class="text-3xl font-bold leading-tight text-gray-900">
            欢迎, {{ auth.user?.username || '用户' }}
          </h1>
        </div>
      </header>
      <main>
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div class="px-4 py-8 sm:px-0">
            <div class="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
              <p class="text-gray-500">这里是仪表盘内容区</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import NavBar from '../components/NavBar.vue';

const auth = useAuthStore();

onMounted(async () => {
  if (!auth.user) {
    await auth.fetchCurrentUser();
  }
});
</script>
