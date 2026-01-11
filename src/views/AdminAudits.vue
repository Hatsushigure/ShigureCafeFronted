<template>
  <div class="min-h-screen bg-gray-50">
    <NavBar />
    
    <div class="py-10 transition-all duration-500 ease-in-out">
      <header>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <h1 
            v-if="!isSearchExpanded" 
            class="text-2xl sm:text-3xl font-extrabold leading-tight text-gray-900 tracking-tight animate-[slide-up_0.5s_ease-out] truncate mr-4"
          >
            注册审核
          </h1>
          
          <div 
            class="flex items-center transition-all duration-300 ease-in-out" 
            :class="isSearchExpanded ? 'flex-1 justify-end' : 'space-x-2 sm:space-x-4'"
          >
            <!-- Search Box -->
            <div 
              class="relative flex items-center transition-all duration-300 ease-in-out" 
              :class="isSearchExpanded ? 'w-full' : 'w-auto'"
            >
              <!-- Mobile Search Toggle -->
              <button 
                @click="isSearchExpanded = true"
                v-if="!isSearchExpanded"
                class="sm:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors animate-[slide-up_0.5s_ease-out_0.1s_both]"
              >
                <Search class="h-5 w-5" />
              </button>

              <!-- Search Input Container -->
              <div 
                class="relative transition-all duration-300 ease-in-out"
                :class="[
                  isSearchExpanded ? 'w-full opacity-100' : 'hidden sm:block sm:w-64 opacity-100'
                ]"
              >
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search class="h-4 w-4 text-gray-400" />
                </div>
                <input
                  v-model="searchQuery"
                  ref="searchInput"
                  type="text"
                  placeholder="搜索审核码/用户名..."
                  class="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200"
                  @keyup.esc="isSearchExpanded = false"
                />
                <!-- Mobile Close button -->
                <button 
                  v-if="isSearchExpanded"
                  @click="isSearchExpanded = false"
                  class="sm:hidden absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X class="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              </div>
            </div>

            <!-- Refresh Button -->
            <button 
              v-show="!isSearchExpanded"
              @click="fetchAudits" 
              class="inline-flex items-center px-3 py-2 sm:px-4 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors animate-[slide-up_0.5s_ease-out_0.1s_both]"
            >
              <RotateCw class="h-4 w-4 sm:mr-2" :class="{ 'animate-[spin_0.6s_linear_infinite]': loading }" />
              <span class="hidden sm:inline">刷新列表</span>
            </button>
          </div>
        </div>
      </header>

      <main>
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8 mt-8">
          <div class="px-4 sm:px-0 animate-[slide-up_0.5s_ease-out_0.2s_both]">
            
            <div class="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100">
              <!-- Loading State -->
              <div v-if="loading && audits.length === 0" class="p-12 flex justify-center items-center text-gray-400">
                <Loader2 class="h-8 w-8 animate-spin" />
              </div>

              <!-- Empty State -->
              <div v-else-if="filteredAudits.length === 0" class="p-12 text-center text-gray-500 flex flex-col items-center">
                <ClipboardList class="h-12 w-12 text-gray-300 mb-3" />
                <p>{{ searchQuery ? '未找到匹配的记录' : '暂无待审核用户' }}</p>
              </div>

              <!-- Audits Table -->
              <div v-else class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50/50">
                    <tr>
                      <th scope="col" class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用户名</th>
                      <th scope="col" class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">电子邮箱</th>
                      <th scope="col" class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">审核码</th>
                      <th scope="col" class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                      <th scope="col" class="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-100">
                    <tr v-for="audit in filteredAudits" :key="audit.auditCode" class="hover:bg-gray-50/80 transition-colors duration-150">
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                          <div class="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs mr-3">
                            {{ (audit.nickname || audit.username).substring(0, 2).toUpperCase() }}
                          </div>
                          <div>
                            <div class="text-sm font-medium text-gray-900">{{ audit.nickname || audit.username }}</div>
                            <div class="text-xs text-gray-400">@{{ audit.username }}</div>
                          </div>
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {{ audit.email }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                         <div class="flex items-center space-x-2">
                           <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800 font-mono">
                             {{ audit.auditCode }}
                           </span>
                           <button 
                             @click="copyToClipboard(audit.auditCode)" 
                             class="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-600 transition-colors" 
                             title="复制审核码"
                           >
                             <Copy class="h-3.5 w-3.5" />
                           </button>
                         </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span 
                          class="px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full"
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
                          @click="confirmApprove(audit)" 
                          class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                        >
                          <CheckCircle class="h-3.5 w-3.5 mr-1" />
                          通过
                        </button>
                        <button 
                          v-if="!audit.isExpired && audit.status !== 'ACTIVE' && audit.status !== 'BANNED'"
                          @click="confirmBan(audit)" 
                          class="ml-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                        >
                          <Ban class="h-3.5 w-3.5 mr-1" />
                          封禁
                        </button>
                        <span v-else class="text-gray-400 text-xs italic">
                          无需操作
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Approve Confirmation Modal -->
    <div v-if="showApproveModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <transition
          enter-active-class="ease-out duration-200"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="ease-in duration-150"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
          appear
        >
          <div class="fixed inset-0 bg-black/20 backdrop-blur-md" aria-hidden="true" @click="showApproveModal = false"></div>
        </transition>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <transition
          enter-active-class="ease-out duration-300"
          enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          enter-to-class="opacity-100 translate-y-0 sm:scale-100"
          leave-active-class="ease-in duration-200"
          leave-from-class="opacity-100 translate-y-0 sm:scale-100"
          leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          appear
        >
          <div class="relative inline-block align-middle bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all w-full sm:my-8 sm:align-middle sm:max-w-xl">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-center">
                <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                  <CheckCircle class="h-6 w-6 text-green-600" />
                </div>
                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 class="text-lg leading-6 font-bold text-gray-900" id="modal-title">通过审核</h3>
                  <div class="mt-2">
                    <p class="text-sm text-gray-500">
                      确定要通过用户 <span class="font-bold text-gray-900">{{ selectedAudit?.nickname || selectedAudit?.username }}</span> 的审核吗？
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button @click="handleApprove" type="button" class="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors">确认通过</button>
              <button @click="showApproveModal = false" type="button" class="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors">取消</button>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <!-- Ban Confirmation Modal -->
    <div v-if="showBanModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <transition
          enter-active-class="ease-out duration-200"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="ease-in duration-150"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
          appear
        >
          <div class="fixed inset-0 bg-black/20 backdrop-blur-md" aria-hidden="true" @click="showBanModal = false"></div>
        </transition>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <transition
          enter-active-class="ease-out duration-300"
          enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          enter-to-class="opacity-100 translate-y-0 sm:scale-100"
          leave-active-class="ease-in duration-200"
          leave-from-class="opacity-100 translate-y-0 sm:scale-100"
          leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          appear
        >
          <div class="relative inline-block align-middle bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all w-full sm:my-8 sm:align-middle sm:max-w-xl">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-center">
                <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <Ban class="h-6 w-6 text-red-600" />
                </div>
                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 class="text-lg leading-6 font-bold text-gray-900" id="modal-title">封禁用户</h3>
                  <div class="mt-2">
                    <p class="text-sm text-gray-500">
                      确定要封禁用户 <span class="font-bold text-gray-900">{{ selectedAudit?.nickname || selectedAudit?.username }}</span> 吗？封禁后该用户将无法登录，且审核记录将被移除。
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button @click="handleBan" type="button" class="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors">确认封禁</button>
              <button @click="showBanModal = false" type="button" class="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors">取消</button>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick } from 'vue';
import api from '../api';
import NavBar from '../components/NavBar.vue';
import { useToastStore } from '../stores/toast';
import { RotateCw, Loader2, ClipboardList, CheckCircle, Search, X, Copy, Ban } from 'lucide-vue-next';
import { formatStatus } from '../utils/formatters';

interface Audit {
  username: string;
  nickname: string;
  email: string;
  status: string;
  auditCode: string;
  isExpired: boolean;
}

const audits = ref<Audit[]>([]);
const loading = ref(true);
const searchQuery = ref('');
const isSearchExpanded = ref(false);
const searchInput = ref<HTMLInputElement | null>(null);
const toast = useToastStore();

const showApproveModal = ref(false);
const showBanModal = ref(false);
const selectedAudit = ref<Audit | null>(null);

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success('复制成功', '审核码已复制到剪贴板');
  } catch (err) {
    toast.error('复制失败', '请手动复制');
  }
};

watch(isSearchExpanded, (val) => {
  if (val) {
    nextTick(() => {
      searchInput.value?.focus();
    });
  }
});

const filteredAudits = computed(() => {
  if (!searchQuery.value) return audits.value;
  const q = searchQuery.value.toLowerCase();
  return audits.value.filter(audit => 
    audit.auditCode.toLowerCase().includes(q) ||
    audit.username.toLowerCase().includes(q) ||
    audit.nickname?.toLowerCase().includes(q) ||
    audit.email.toLowerCase().includes(q)
  );
});

const fetchAudits = async () => {
  loading.value = true;
  const minTimer = new Promise(resolve => setTimeout(resolve, 600));
  try {
    const codes = await api.get<string[]>('/registrations');
    
    const detailsPromises = codes.map(code => api.get<Audit>(`/registrations/${code}`));
    const details = await Promise.all(detailsPromises);
    
    audits.value = details;
    await minTimer;
  } catch (error: any) {
    toast.error('获取审核列表失败', error.message);
  } finally {
    loading.value = false;
  }
};

const confirmApprove = (audit: Audit) => {
  selectedAudit.value = audit;
  showApproveModal.value = true;
};

const handleApprove = async () => {
  if (!selectedAudit.value) return;
  try {
    await api.patch(`/registrations/${selectedAudit.value.auditCode}`);
    toast.success('审核已通过');
    showApproveModal.value = false;
    await fetchAudits();
  } catch (error: any) {
    toast.error('操作失败', error.message);
  }
};

const confirmBan = (audit: Audit) => {
  selectedAudit.value = audit;
  showBanModal.value = true;
};

const handleBan = async () => {
  if (!selectedAudit.value) return;
  try {
    await api.delete(`/registrations/${selectedAudit.value.auditCode}`);
    toast.success('用户已封禁');
    showBanModal.value = false;
    await fetchAudits();
  } catch (error: any) {
    toast.error('操作失败', error.message);
  }
};

onMounted(() => {
  fetchAudits();
});
</script>
