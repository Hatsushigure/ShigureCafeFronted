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
                      to="/notices"
                      class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-200"
                      :class="[
                        $route.path === '/notices'
                          ? 'border-blue-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 hover:-translate-y-0.5'
                      ]"
                    >
                      公告
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
                  </div>
                </div>
                <div class="flex items-center">
                  <div 
                    v-if="auth.user" 
                    class="relative ml-3" 
                    ref="menuRef"
                    @mouseenter="onMouseEnter"
                    @mouseleave="onMouseLeave"
                  >
                    <div>
                      <button 
                        @click.stop="toggleMenu"
                        class="flex items-center max-w-xs bg-white rounded-full focus:outline-none transition-all duration-200 p-0.5 hover:bg-gray-50"
                        id="user-menu-button" 
                        aria-expanded="false" 
                        aria-haspopup="true"
                      >
                        <span class="sr-only">Open user menu</span>
                        <div 
                          :class="[avatarColor, 'w-9 h-9 rounded-full flex items-center justify-center text-white font-bold shadow-sm border-2 border-white ring-2 ring-gray-50']"
                        >
                          {{ avatarChar }}
                        </div>
                      </button>
                    </div>

                    <transition
                      enter-active-class="transition ease-out duration-100"
                      enter-from-class="transform opacity-0 scale-95"
                      enter-to-class="transform opacity-100 scale-100"
                      leave-active-class="transition ease-in duration-75"
                      leave-from-class="transform opacity-100 scale-100"
                      leave-to-class="transform opacity-0 scale-95"
                    >
                      <div 
                        v-if="isMenuOpen" 
                        class="origin-top-right absolute right-0 mt-2 w-48 rounded-xl shadow-xl py-1 bg-white focus:outline-none z-50 border border-gray-100" 
                        role="menu" 
                        aria-orientation="vertical" 
                        aria-labelledby="user-menu-button" 
                        tabindex="-1"
                      >
                        <div class="px-4 py-3 border-b border-gray-50">
                          <p class="text-sm text-gray-500">登录身份</p>
                          <p class="text-sm font-medium text-gray-900 truncate">{{ auth.user.nickname || auth.user.username }}</p>
                        </div>
                        <router-link to="/profile" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors" role="menuitem" @click="isMenuOpen = false">个人中心</router-link>
                        <router-link to="/security" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors" role="menuitem" @click="isMenuOpen = false">安全设置</router-link>
                        <div class="border-t border-gray-50 mt-1">
                          <button 
                            @click="handleLogout" 
                            class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors" 
                            role="menuitem"
                          >
                            退出登录
                          </button>
                        </div>
                      </div>
                    </transition>
                  </div>
                  <div class="-mr-2 flex items-center sm:hidden">
                    <!-- Mobile menu button -->
                    <button @click="isOpen = !isOpen" type="button" class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none transition-colors" aria-controls="mobile-menu" aria-expanded="false">
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
                <div v-if="auth.user" class="pt-4 pb-3 border-b border-gray-200 px-4 flex items-center bg-gray-50/50">
                  <div 
                    :class="[avatarColor, 'w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm border-2 border-white']"
                  >
                    {{ avatarChar }}
                  </div>
                  <div class="ml-3">
                    <div class="text-base font-medium text-gray-800">{{ auth.user.nickname || auth.user.username }}</div>
                    <div class="text-sm font-medium text-gray-500">{{ auth.user.email }}</div>
                  </div>
                </div>
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
                    to="/notices"
                    @click="isOpen = false"
                    class="block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-150 ease-in-out"
                    :class="[
                      $route.path === '/notices'
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                    ]"
                  >
                    公告
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
                  <button @click="handleLogoutAndClose" class="block w-full text-left pl-3 pr-4 py-2 border-l-4 text-base font-medium border-transparent text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors duration-150 ease-in-out">
                    退出登录
                  </button>
                </div>
              </div>
            </transition>  </nav>

</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const auth = useAuthStore();
const isOpen = ref(false);
const isMenuOpen = ref(false);
const menuRef = ref<HTMLElement | null>(null);
let closeTimer: number | null = null;

const onMouseEnter = () => {
  if (window.matchMedia('(hover: hover)').matches) {
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }
    isMenuOpen.value = true;
  }
};

const onMouseLeave = () => {
  if (window.matchMedia('(hover: hover)').matches) {
    closeTimer = window.setTimeout(() => {
      isMenuOpen.value = false;
      closeTimer = null;
    }, 100);
  }
};

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = (e: MouseEvent) => {
  if (menuRef.value && !menuRef.value.contains(e.target as Node)) {
    isMenuOpen.value = false;
  }
};

onMounted(() => {
  window.addEventListener('click', closeMenu);
});

onUnmounted(() => {
  window.removeEventListener('click', closeMenu);
});

const avatarChar = computed(() => {
  const name = auth.user?.nickname || auth.user?.username || '?';
  return name.charAt(0).toUpperCase();
});

const avatarColor = computed(() => {
  const name = auth.user?.nickname || auth.user?.username || '';
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

const handleLogout = async () => {
  await auth.logout();
  router.push('/login');
};

const handleLogoutAndClose = async () => {
  await handleLogout();
  isOpen.value = false;
};
</script>
