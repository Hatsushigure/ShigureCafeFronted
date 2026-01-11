<template>
  <nav class="sticky top-0 z-30 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 transition-all duration-300">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div class="flex justify-between h-16">
                <div class="flex items-center">
                  <div class="flex-shrink-0 flex items-center transform hover:scale-105 transition-transform duration-200 cursor-pointer" @click="$router.push('/dashboard')">
                    <h1 class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">猫咖</h1>
                  </div>
                  <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
                    <router-link
                      to="/dashboard"
                      class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-200"
                      :class="[
                        $route.path === '/dashboard'
                          ? 'border-blue-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 hover:-translate-y-0.5'
                      ]"
                    >
                      首页
                    </router-link>
                    <router-link
                      to="/profile"
                      class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-200"
                      :class="[
                        $route.path === '/profile'
                          ? 'border-blue-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 hover:-translate-y-0.5'
                      ]"
                    >
                      个人信息
                    </router-link>
                    <router-link
                      to="/security"
                      class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-200"
                      :class="[
                        $route.path === '/security'
                          ? 'border-blue-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 hover:-translate-y-0.5'
                      ]"
                    >
                      安全设置
                    </router-link>
                    <router-link
                      v-if="auth.user?.role === 'ADMIN'"
                      to="/admin/users"
                      class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-200"
                      :class="[
                        $route.path === '/admin/users'
                          ? 'border-blue-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 hover:-translate-y-0.5'
                      ]"
                    >
                      用户管理
                    </router-link>
                    <router-link
                      v-if="auth.user?.role === 'ADMIN'"
                      to="/admin/audits"
                      class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-200"
                      :class="[
                        $route.path === '/admin/audits'
                          ? 'border-blue-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 hover:-translate-y-0.5'
                      ]"
                    >
                      审核管理
                    </router-link>
                    <router-link
                      v-if="auth.user?.role === 'ADMIN'"
                      to="/admin/notices"
                      class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-200"
                      :class="[
                        $route.path === '/admin/notices'
                          ? 'border-blue-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 hover:-translate-y-0.5'
                      ]"
                    >
                      公告管理
                    </router-link>
                  </div>
                </div>
                <div class="flex items-center">
                  <div class="hidden sm:flex sm:items-center">
                    <button @click="handleLogout" class="ml-4 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-full transition-all duration-200 hover:shadow-md active:scale-95">
                      退出登录
                    </button>
                  </div>
                  <div class="-mr-2 flex items-center sm:hidden">
                    <!-- Mobile menu button -->
                    <button @click="isOpen = !isOpen" type="button" class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors" aria-controls="mobile-menu" aria-expanded="false">
                      <span class="sr-only">Open main menu</span>
                      <svg v-if="!isOpen" class="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                      <svg v-else class="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
        
            <!-- Mobile menu, show/hide based on menu state. -->
            <transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="transform -translate-y-2 opacity-0"
              enter-to-class="transform translate-y-0 opacity-100"
              leave-active-class="transition duration-150 ease-in"
              leave-from-class="transform translate-y-0 opacity-100"
              leave-to-class="transform -translate-y-2 opacity-0"
            >
              <div v-if="isOpen" class="sm:hidden absolute w-full bg-white shadow-lg border-b border-gray-100" id="mobile-menu">
                <div class="pt-2 pb-3 space-y-1">
                  <!-- Mobile menu items -->
                  <router-link
                    to="/dashboard"
                    @click="isOpen = false"
                    class="block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-150 ease-in-out"
                    :class="[
                      $route.path === '/dashboard'
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                    ]"
                  >
                    首页
                  </router-link>
                  <router-link
                    to="/profile"
                    @click="isOpen = false"
                    class="block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-150 ease-in-out"
                    :class="[
                      $route.path === '/profile'
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                    ]"
                  >
                    个人信息
                  </router-link>
                  <router-link
                    to="/security"
                    @click="isOpen = false"
                    class="block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-150 ease-in-out"
                    :class="[
                      $route.path === '/security'
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                    ]"
                  >
                    安全设置
                  </router-link>
                  <router-link
                    v-if="auth.user?.role === 'ADMIN'"
                    to="/admin/users"
                    @click="isOpen = false"
                    class="block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-150 ease-in-out"
                    :class="[
                      $route.path === '/admin/users'
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                    ]"
                  >
                    用户管理
                  </router-link>
                  <router-link
                    v-if="auth.user?.role === 'ADMIN'"
                    to="/admin/audits"
                    @click="isOpen = false"
                    class="block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-150 ease-in-out"
                    :class="[
                      $route.path === '/admin/audits'
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                    ]"
                  >
                    审核管理
                  </router-link>
                  <router-link
                    v-if="auth.user?.role === 'ADMIN'"
                    to="/admin/notices"
                    @click="isOpen = false"
                    class="block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-150 ease-in-out"
                    :class="[
                      $route.path === '/admin/notices'
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                    ]"
                  >
                    公告管理
                  </router-link>
                  <button @click="handleLogoutAndClose" class="block w-full text-left pl-3 pr-4 py-2 border-l-4 text-base font-medium border-transparent text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors duration-150 ease-in-out">
                    退出登录
                  </button>
                </div>
              </div>
            </transition>  </nav>

</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const auth = useAuthStore();
const isOpen = ref(false);

const handleLogout = async () => {
  await auth.logout();
  router.push('/login');
};

const handleLogoutAndClose = async () => {
  await handleLogout();
  isOpen.value = false;
};
</script>
