<template>
  <div class="min-h-screen bg-gray-50">
    <NavBar />
    
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-2xl font-bold text-gray-900">注册审核</h1>
          <button 
            @click="fetchAudits" 
            class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            刷新列表
          </button>
        </div>

        <div class="bg-white shadow overflow-hidden sm:rounded-lg">
          <div v-if="loading" class="p-6 text-center text-gray-500">
            加载中...
          </div>
          <div v-else-if="audits.length === 0" class="p-6 text-center text-gray-500">
            暂无待审核用户
          </div>
          <table v-else class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  用户ID
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  用户名
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  邮箱
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  审核码
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="audit in audits" :key="audit.userId">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ audit.userId }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ audit.username }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ audit.email }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                  {{ audit.auditCode }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    :class="{
                      'bg-green-100 text-green-800': audit.status === 'ACTIVE',
                      'bg-yellow-100 text-yellow-800': audit.status === 'PENDING',
                      'bg-red-100 text-red-800': audit.status === 'BANNED',
                      'bg-gray-100 text-gray-800': audit.isExpired
                    }"
                  >
                    {{ audit.isExpired ? '已过期' : formatStatus(audit.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    v-if="!audit.isExpired && audit.status !== 'ACTIVE'"
                    @click="approveAudit(audit.userId)" 
                    class="text-indigo-600 hover:text-indigo-900 font-bold"
                  >
                    通过
                  </button>
                  <span v-else class="text-gray-400 cursor-not-allowed">
                    通过
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../api';
import NavBar from '../components/NavBar.vue';
import { useToastStore } from '../stores/toast';

interface Audit {
  userId: number;
  username: string;
  email: string;
  status: string;
  auditCode: string;
  isExpired: boolean;
}

const audits = ref<Audit[]>([]);
const loading = ref(true);
const toast = useToastStore();

const fetchAudits = async () => {
  loading.value = true;
  try {
    const response = await api.get('/users/audits');
    audits.value = response.data;
  } catch (error) {
    toast.error('Failed to load audits');
  } finally {
    loading.value = false;
  }
};

const approveAudit = async (auditId: number) => {
  if (!confirm('确定要通过该用户的审核吗？')) return;
  
  try {
    await api.post(`/users/audits/${auditId}/approve`);
    toast.success('审核已通过');
    await fetchAudits();
  } catch (error) {
    toast.error('操作失败');
  }
};

const formatStatus = (status: string) => {
  const map: Record<string, string> = {
    ACTIVE: '正常',
    PENDING: '待审核',
    BANNED: '封禁'
  };
  return map[status] || status;
};

onMounted(() => {
  fetchAudits();
});
</script>
