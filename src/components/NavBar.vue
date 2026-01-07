<template>
  <nav class="bg-white shadow">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex">
          <div class="flex-shrink-0 flex items-center">
            <h1 class="text-xl font-bold text-gray-800">Shigure Cafe</h1>
          </div>
          <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
            <router-link 
              to="/dashboard" 
              class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-150 ease-in-out"
              :class="[
                $route.path === '/dashboard' 
                  ? 'border-blue-500 text-gray-900' 
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              ]"
            >
              首页
            </router-link>
            <router-link 
              to="/profile" 
              class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-150 ease-in-out"
              :class="[
                $route.path === '/profile' 
                  ? 'border-blue-500 text-gray-900' 
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              ]"
            >
              个人信息
            </router-link>
            <router-link 
              to="/security" 
              class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-150 ease-in-out"
              :class="[
                $route.path === '/security' 
                  ? 'border-blue-500 text-gray-900' 
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              ]"
            >
              安全设置
            </router-link>
            <router-link 
              v-if="auth.user?.role === 'ADMIN'"
              to="/admin/users" 
              class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-150 ease-in-out"
              :class="[
                $route.path === '/admin/users' 
                  ? 'border-blue-500 text-gray-900' 
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              ]"
            >
              用户管理
            </router-link>
          </div>
        </div>
        <div class="flex items-center">
          <button @click="handleLogout" class="ml-4 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors">
            退出登录
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const auth = useAuthStore();

const handleLogout = async () => {
  await auth.logout();
  router.push('/login');
};
</script>
