<template>
  <div class="min-h-screen bg-gray-50">
    <NavBar />

    <div class="py-10 transition-all duration-500 ease-in-out">
      <header>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 class="text-3xl font-extrabold leading-tight text-gray-900 tracking-tight animate-[slide-up_0.5s_ease-out]">
            欢迎回来, <span class="text-indigo-600">{{ auth.user?.nickname || auth.user?.username || '用户' }}</span>
          </h1>
          <div class="text-sm text-gray-500 animate-[slide-up_0.5s_ease-out_0.1s_both]">
            今天是 {{ new Date().toLocaleDateString() }}
          </div>
        </div>
      </header>
      <main>
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8 mt-8">
          <div class="px-4 sm:px-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <!-- Quick Action Cards -->
            <div @click="$router.push('/profile')" class="group bg-white overflow-hidden shadow rounded-2xl cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-[slide-up_0.5s_ease-out_0.2s_both]">
              <div class="p-6">
                <div class="flex items-center">
                  <div class="flex-shrink-0 bg-blue-100 rounded-md p-3 group-hover:bg-blue-200 transition-colors">
                    <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div class="ml-4">
                    <h3 class="text-lg font-medium text-gray-900">个人信息</h3>
                    <p class="mt-1 text-sm text-gray-500">查看和编辑您的个人资料</p>
                  </div>
                </div>
              </div>
              <div class="bg-gray-50 px-6 py-3">
                <div class="text-sm">
                  <span class="font-medium text-blue-600 group-hover:text-blue-500 transition-colors">前往查看 &rarr;</span>
                </div>
              </div>
            </div>

            <div @click="$router.push('/security')" class="group bg-white overflow-hidden shadow rounded-2xl cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-[slide-up_0.5s_ease-out_0.3s_both]">
              <div class="p-6">
                <div class="flex items-center">
                  <div class="flex-shrink-0 bg-green-100 rounded-md p-3 group-hover:bg-green-200 transition-colors">
                    <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div class="ml-4">
                    <h3 class="text-lg font-medium text-gray-900">安全设置</h3>
                    <p class="mt-1 text-sm text-gray-500">修改密码或更新邮箱</p>
                  </div>
                </div>
              </div>
              <div class="bg-gray-50 px-6 py-3">
                <div class="text-sm">
                  <span class="font-medium text-green-600 group-hover:text-green-500 transition-colors">前往设置 &rarr;</span>
                </div>
              </div>
            </div>

            <!-- Admin Cards -->
            <div v-if="auth.user?.role === 'ADMIN'" @click="$router.push('/admin/users')" class="group bg-white overflow-hidden shadow rounded-2xl cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-[slide-up_0.5s_ease-out_0.4s_both]">
              <div class="p-6">
                <div class="flex items-center">
                  <div class="flex-shrink-0 bg-purple-100 rounded-md p-3 group-hover:bg-purple-200 transition-colors">
                    <svg class="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div class="ml-4">
                    <h3 class="text-lg font-medium text-gray-900">用户管理</h3>
                    <p class="mt-1 text-sm text-gray-500">管理系统用户和权限</p>
                  </div>
                </div>
              </div>
              <div class="bg-gray-50 px-6 py-3">
                <div class="text-sm">
                  <span class="font-medium text-purple-600 group-hover:text-purple-500 transition-colors">进入管理 &rarr;</span>
                </div>
              </div>
            </div>

             <div v-if="auth.user?.role === 'ADMIN'" @click="$router.push('/admin/audits')" class="group bg-white overflow-hidden shadow rounded-2xl cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-[slide-up_0.5s_ease-out_0.5s_both]">
              <div class="p-6">
                <div class="flex items-center">
                  <div class="flex-shrink-0 bg-orange-100 rounded-md p-3 group-hover:bg-orange-200 transition-colors">
                    <svg class="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <div class="ml-4">
                    <h3 class="text-lg font-medium text-gray-900">审核管理</h3>
                    <p class="mt-1 text-sm text-gray-500">处理用户注册审核请求</p>
                  </div>
                </div>
              </div>
              <div class="bg-gray-50 px-6 py-3">
                <div class="text-sm">
                  <span class="font-medium text-orange-600 group-hover:text-orange-500 transition-colors">处理审核 &rarr;</span>
                </div>
              </div>
            </div>

          </div>

          <!-- Recent Activity Placeholder -->
          <div class="mt-8 animate-[slide-up_0.5s_ease-out_0.6s_both]">
             <h2 class="text-lg font-medium text-gray-900 mb-4">系统公告</h2>
             <div class="bg-white shadow rounded-2xl p-6 border border-gray-100">
                <div class="flex items-start space-x-4">
                   <div class="flex-shrink-0">
                      <span class="inline-flex items-center justify-center h-10 w-10 rounded-full bg-blue-100">
                         <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                         </svg>
                      </span>
                   </div>
                   <div>
                      <h4 class="text-lg font-bold text-gray-900">系统升级通知</h4>
                      <p class="mt-1 text-gray-600">欢迎使用全新的 猫咖 用户管理系统。我们对界面进行了全面的现代化升级，希望您喜欢！</p>
                      <p class="mt-2 text-sm text-gray-500">{{ new Date().toLocaleDateString() }}</p>
                   </div>
                </div>
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

