<template>
  <div class="min-h-screen bg-gray-50">
    <NavBar />

    <div class="py-10 transition-all duration-500 ease-in-out">
      <header>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 class="text-3xl font-extrabold leading-tight text-gray-900 tracking-tight animate-[slide-up_0.5s_ease-out]">
            公告管理
          </h1>
          <div class="flex space-x-3">
            <button @click="openCreate" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors animate-[slide-up_0.5s_ease-out_0.1s_both]">
              <Plus class="h-4 w-4 mr-2" />
              发布公告
            </button>
            <button @click="fetchNotices" class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors animate-[slide-up_0.5s_ease-out_0.1s_both]">
              <RotateCw class="h-4 w-4 mr-2" :class="{ 'animate-[spin_0.6s_linear_infinite]': loading }" />
              刷新
            </button>
          </div>
        </div>
      </header>
      
      <main>
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8 mt-8">
          <div class="px-4 sm:px-0 animate-[slide-up_0.5s_ease-out_0.2s_both]">
            
            <div class="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100">
              <!-- Loading State -->
              <div v-if="loading && notices.length === 0" class="p-12 flex justify-center items-center text-gray-400">
                <Loader2 class="h-8 w-8 animate-spin" />
              </div>

              <!-- Empty State -->
              <div v-else-if="notices.length === 0" class="p-12 text-center text-gray-500 flex flex-col items-center">
                <Megaphone class="h-12 w-12 text-gray-300 mb-3" />
                <p>暂无公告数据</p>
              </div>

              <!-- Notices Table -->
              <div v-else class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50/50">
                    <tr>
                      <th scope="col" class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">标题</th>
                      <th scope="col" class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">作者</th>
                      <th scope="col" class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">发布时间</th>
                      <th scope="col" class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">最后更新</th>
                      <th scope="col" class="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-100">
                    <tr v-for="notice in notices" :key="notice.id" class="hover:bg-gray-50/80 transition-colors duration-150">
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                          <span v-if="notice.pinned" class="mr-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-700 rounded-md">
                            置顶
                          </span>
                          <div class="text-sm font-medium text-gray-900">{{ notice.title }}</div>
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {{ notice.authorNickname }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {{ new Date(notice.createdAt).toLocaleString() }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {{ new Date(notice.updatedAt).toLocaleString() }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button @click="openEdit(notice)" class="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 p-1.5 rounded-md transition-colors" title="编辑公告">
                          <Edit2 class="h-4 w-4" />
                        </button>
                        <button @click="confirmDelete(notice)" class="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-1.5 rounded-md transition-colors" title="删除公告">
                          <Trash2 class="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- Edit/Create Notice Modal -->
      <div v-if="showEditModal" class="fixed inset-0 z-50 overflow-y-auto">
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
            <div class="fixed inset-0 bg-black/20 backdrop-blur-md" aria-hidden="true" @click="closeEdit"></div>
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
            <div class="relative inline-block align-middle bg-white rounded-2xl text-left shadow-xl transform transition-all w-full sm:my-8 sm:align-middle sm:max-w-4xl">
              <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 rounded-t-2xl">
                <div class="sm:flex sm:items-start">
                  <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Megaphone class="h-6 w-6 text-indigo-600" />
                  </div>
                  <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 class="text-lg leading-6 font-bold text-gray-900" id="modal-title">
                      {{ selectedNotice ? '编辑公告' : '发布公告' }}
                    </h3>
                    
                    <div class="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <!-- Editor Column -->
                      <div class="space-y-4">
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-1">标题</label>
                          <input v-model="form.title" type="text" class="appearance-none rounded-xl relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 sm:text-sm" placeholder="公告标题">
                        </div>
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-1">内容 (支持 Markdown)</label>
                          <textarea v-model="form.content" rows="12" class="appearance-none rounded-xl relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 sm:text-sm" placeholder="公告内容"></textarea>
                        </div>
                        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 transition-all hover:bg-gray-100/50">
                          <div class="flex items-center space-x-3">
                            <div class="p-2 bg-orange-100 rounded-lg">
                              <ArrowUpToLine class="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                              <span class="block text-sm font-bold text-gray-900">置顶此公告</span>
                            </div>
                          </div>
                          <button 
                            @click="form.pinned = !form.pinned"
                            type="button"
                            class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                            :class="form.pinned ? 'bg-orange-500' : 'bg-gray-200'"
                          >
                            <span 
                              class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                              :class="form.pinned ? 'translate-x-5' : 'translate-x-0'"
                            ></span>
                          </button>
                        </div>
                      </div>

                      <!-- Preview Column -->
                      <div class="flex flex-col">
                        <label class="block text-sm font-medium text-gray-700 mb-1">实时预览</label>
                        <div class="flex-1 border border-gray-100 rounded-xl p-4 bg-gray-50/30 overflow-y-auto max-h-[300px] lg:max-h-[500px]">
                           <div v-if="!form.content" class="h-full flex items-center justify-center text-gray-400 text-sm italic">
                             输入内容以预览...
                           </div>
                           <div v-else class="prose prose-sm prose-slate max-w-none" v-html="renderMarkdown(form.content)"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-2xl">
                <button @click="saveNotice" type="button" class="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors">
                  {{ saving ? '提交中...' : '提交' }}
                </button>
                <button @click="closeEdit" type="button" class="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors">取消</button>
              </div>
            </div>
          </transition>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteModal" class="fixed inset-0 z-50 overflow-y-auto">
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
            <div class="fixed inset-0 bg-black/20 backdrop-blur-md" aria-hidden="true" @click="showDeleteModal = false"></div>
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
                    <Trash2 class="h-6 w-6 text-red-600" />
                  </div>
                  <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 class="text-lg leading-6 font-bold text-gray-900" id="modal-title">删除公告</h3>
                    <div class="mt-2">
                      <p class="text-sm text-gray-500">
                        您确定要删除公告 <span class="font-bold text-gray-900">{{ selectedNotice?.title }}</span> 吗？此操作不可撤销。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button @click="handleDelete" type="button" class="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors">确认删除</button>
                <button @click="showDeleteModal = false" type="button" class="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors">取消</button>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import NavBar from '../components/NavBar.vue';
import api from '../api';
import { useToastStore } from '../stores/toast';
import { Plus, RotateCw, Loader2, Megaphone, Edit2, Trash2, ArrowUpToLine } from 'lucide-vue-next';
import { marked } from 'marked';

interface Notice {
  id: number;
  title: string;
  content: string;
  pinned: boolean;
  authorNickname: string;
  createdAt: string;
  updatedAt: string;
}

const notices = ref<Notice[]>([]);
const loading = ref(false);
const saving = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const selectedNotice = ref<Notice | null>(null);
const toast = useToastStore();

const form = ref({
  title: '',
  content: '',
  pinned: false
});

const fetchNotices = async () => {
  loading.value = true;
  const minTimer = new Promise(resolve => setTimeout(resolve, 600));
  try {
    const data = await api.get<Notice[]>('/notices');
    notices.value = data;
    await minTimer;
  } catch (error: any) {
    toast.error('获取公告失败', error.message);
  } finally {
    loading.value = false;
  }
};

const openCreate = () => {
  selectedNotice.value = null;
  form.value.title = '';
  form.value.content = '';
  form.value.pinned = false;
  showEditModal.value = true;
};

const openEdit = (notice: Notice) => {
  selectedNotice.value = notice;
  form.value.title = notice.title;
  form.value.content = notice.content;
  form.value.pinned = notice.pinned;
  showEditModal.value = true;
};

const closeEdit = () => {
  showEditModal.value = false;
  selectedNotice.value = null;
};

const saveNotice = async () => {
  if (!form.value.title || !form.value.content) {
    toast.error('请填写标题和内容');
    return;
  }

  saving.value = true;
  try {
    if (selectedNotice.value) {
      await api.put(`/notices/${selectedNotice.value.id}`, form.value);
      toast.success('公告更新成功');
    } else {
      await api.post('/notices', form.value);
      toast.success('公告发布成功');
    }
    closeEdit();
    fetchNotices();
  } catch (error: any) {
    toast.error('保存失败', error.message);
  } finally {
    saving.value = false;
  }
};

const confirmDelete = (notice: Notice) => {
  selectedNotice.value = notice;
  showDeleteModal.value = true;
};

const handleDelete = async () => {
  if (!selectedNotice.value) return;
  try {
    await api.delete(`/notices/${selectedNotice.value.id}`);
    toast.success('公告已删除');
    showDeleteModal.value = false;
    fetchNotices();
  } catch (error: any) {
    toast.error('删除失败', error.message);
  }
};

const renderMarkdown = (content: string) => {
  return marked.parse(content);
};

onMounted(() => {
  fetchNotices();
});
</script>
