<template>
  <div class="min-h-screen bg-gray-50">
    <NavBar />

    <div class="py-10 transition-all duration-500 ease-in-out">
      <header>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 class="text-3xl font-extrabold leading-tight text-gray-900 tracking-tight animate-slide-up">
            用户管理
          </h1>
          <BaseButton 
            variant="secondary"
            @click="fetchUsers" 
            :loading="loading"
            class="animate-slide-up animate-delay-50"
          >
            <RotateCw v-if="!loading" class="h-4 w-4 mr-2" />
            刷新列表
          </BaseButton>
        </div>
      </header>
      
      <main>
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8 mt-8">
          <div class="px-4 sm:px-0">
            <Transition name="fade-slide" mode="out-in">
              <div :key="loading ? 'loading' : (users.length > 0 ? 'data' : 'empty')">
                <BaseCard body-class="p-0 overflow-hidden">
                  <!-- Loading State -->
                  <div v-if="loading" class="p-12 flex justify-center items-center text-gray-400">
                    <Loader2 class="h-8 w-8 animate-spin" />
                  </div>

                  <!-- Empty State -->
                  <div v-else-if="users.length === 0" class="p-12 text-center text-gray-500 flex flex-col items-center">
                    <Users class="h-12 w-12 text-gray-300 mb-3" />
                    <p>暂无用户数据</p>
                  </div>

                  <!-- Users Table -->
                  <div v-else class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                      <thead class="bg-gray-50/50">
                        <tr>
                          <th scope="col" class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用户 / 昵称</th>
                          <th scope="col" class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">电子邮箱</th>
                          <th scope="col" class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用户角色</th>
                          <th scope="col" class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">双重验证</th>
                          <th scope="col" class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                          <th scope="col" class="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                        </tr>
                      </thead>
                      <tbody class="bg-white divide-y divide-gray-100">
                        <tr v-for="user in users" :key="user.username" class="hover:bg-gray-50/80 transition-colors duration-150">
                          <td class="px-6 py-4 whitespace-nowrap">
                            <div class="flex items-center">
                              <div 
                                :class="[getAvatarColor(user), 'h-9 w-9 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm border-2 border-white ring-2 ring-gray-50 flex-shrink-0']"
                              >
                                {{ getAvatarChar(user) }}
                              </div>
                              <div class="ml-3">
                                <div class="text-sm font-medium text-gray-900">{{ user.username }}</div>
                                <div class="text-xs text-gray-500">{{ user.nickname || '未设置昵称' }}</div>
                              </div>
                            </div>
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ user.email }}</td>
                          <td class="px-6 py-4 whitespace-nowrap">
                            <span :class="roleClass(user.role)" class="px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full">
                              {{ formatRole(user.role) }}
                            </span>
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap">
                            <span :class="[
                              'px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full',
                              user.twoFactorEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            ]">
                              {{ user.twoFactorEnabled ? '已开启' : '未开启' }}
                            </span>
                          </td>
                           <td class="px-6 py-4 whitespace-nowrap">
                            <span :class="[
                              'px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full',
                              user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                              user.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'
                            ]">
                              {{ formatStatus(user.status) }}
                            </span>
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                            <button @click="openEdit(user)" class="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 p-1.5 rounded-md transition-colors" title="编辑用户">
                              <Edit2 class="h-4 w-4" />
                            </button>
                            <button @click="openPassword(user)" class="text-orange-600 hover:text-orange-900 bg-orange-50 hover:bg-orange-100 p-1.5 rounded-md transition-colors" title="重置密码">
                              <KeyRound class="h-4 w-4" />
                            </button>
                            <button v-if="user.username !== auth.user?.username && user.status !== 'BANNED'" @click="confirmBan(user)" class="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-1.5 rounded-md transition-colors" title="封禁用户">
                              <Ban class="h-4 w-4" />
                            </button>
                            <button v-if="user.status === 'BANNED'" @click="confirmPardon(user)" class="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 p-1.5 rounded-md transition-colors" title="解除封禁">
                              <UserCheck class="h-4 w-4" />
                            </button>
                            <button v-if="user.username !== auth.user?.username" @click="confirmDelete(user)" class="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-1.5 rounded-md transition-colors" title="删除用户">
                              <Trash2 class="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </BaseCard>
              </div>
            </Transition>
          </div>
        </div>
      </main>

      <!-- Edit User Modal -->
      <Modal :show="showEditModal" :title="`编辑用户: ${selectedUser?.username}`" @close="closeEdit">
        <div class="mt-4 space-y-4">
          <BaseInput v-model="editForm.nickname" label="昵称" placeholder="未设置昵称" />
          <BaseInput v-model="editForm.email" label="电子邮箱" type="email" />
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">用户角色</label>
            <div class="relative">
                <button 
                @click="showRoleDropdown = !showRoleDropdown"
                type="button"
                class="relative w-full bg-white/50 border border-gray-300 rounded-xl shadow-sm pl-4 pr-10 py-2.5 text-left cursor-default focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 sm:text-sm transition-all duration-200"
              >
                <span class="block truncate font-medium text-gray-900">{{ formatRole(editForm.role) }}</span>
                <span class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ChevronDown class="h-4 w-4 text-gray-400 transition-transform duration-300" :class="{ 'rotate-180': showRoleDropdown }" />
                </span>
              </button>

              <transition
                enter-active-class="transition ease-out duration-200"
                enter-from-class="opacity-0 scale-95 -translate-y-2"
                enter-to-class="opacity-100 scale-100 translate-y-0"
                leave-active-class="transition ease-in duration-150"
                leave-from-class="opacity-100 scale-100 translate-y-0"
                leave-to-class="opacity-0 scale-95 -translate-y-2"
              >
                <div v-if="showRoleDropdown" class="absolute z-60 mt-1 w-full bg-white/95 backdrop-blur-lg shadow-xl max-h-60 rounded-xl py-1 text-base overflow-auto focus:outline-none sm:text-sm border border-gray-100">
                  <div 
                    v-for="role in ['USER', 'ADMIN']" 
                    :key="role"
                    @click="selectRole(role)"
                    class="cursor-pointer select-none relative py-2.5 pl-4 pr-9 hover:bg-blue-50 transition-colors"
                    :class="editForm.role === role ? 'text-blue-600 bg-blue-50/50' : 'text-gray-900'"
                  >
                    <span class="block truncate" :class="{ 'font-bold': editForm.role === role }">{{ formatRole(role) }}</span>
                    <span v-if="editForm.role === role" class="absolute inset-y-0 right-0 flex items-center pr-4">
                      <Check class="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </transition>
            </div>
          </div>
        </div>
        <template #footer>
          <BaseButton @click="saveEdit" label="保存更改" />
          <BaseButton variant="outline" @click="closeEdit" label="取消" />
        </template>
      </Modal>

      <!-- Reset Password Modal -->
      <Modal :show="showPasswordModal" :title="`重置密码: ${selectedUser?.username}`" @close="closePassword">
        <div class="mt-4 space-y-4">
          <BaseInput v-model="passwordForm.newPassword" label="新密码" type="password" placeholder="请输入新密码" />
          <BaseInput v-model="passwordForm.confirmPassword" label="确认密码" type="password" placeholder="请再次输入新密码" />
          <p class="mt-2 text-xs text-gray-500">此操作将强制重置用户的登录密码。</p>
        </div>
        <template #footer>
          <BaseButton variant="danger" @click="savePassword" label="确认重置" />
          <BaseButton variant="outline" @click="closePassword" label="取消" />
        </template>
      </Modal>

      <!-- Delete Confirmation Modal -->
      <Modal :show="showDeleteModal" title="删除用户" @close="showDeleteModal = false">
        <div class="sm:flex sm:items-center">
          <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
            <Trash2 class="h-6 w-6 text-red-600" />
          </div>
          <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <div class="mt-2">
              <p class="text-sm text-gray-500">
                您确定要删除用户 <span class="font-bold text-gray-900">{{ selectedUser?.username }}</span> 吗？此操作不可撤销，该用户的所有数据将被永久移除。
              </p>
            </div>
          </div>
        </div>
        <template #footer>
          <BaseButton variant="danger" @click="handleDelete" label="确认删除" />
          <BaseButton variant="outline" @click="showDeleteModal = false" label="取消" />
        </template>
      </Modal>

      <!-- Ban Confirmation Modal -->
      <Modal :show="showBanModal" title="封禁用户" @close="showBanModal = false">
        <div class="sm:flex sm:items-center">
          <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
            <Ban class="h-6 w-6 text-red-600" />
          </div>
          <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <div class="mt-2">
              <p class="text-sm text-gray-500">
                您确定要封禁用户 <span class="font-bold text-gray-900">{{ selectedUser?.username }}</span> 吗？封禁后该用户将无法登录。
              </p>
            </div>
          </div>
        </div>
        <template #footer>
          <BaseButton variant="danger" @click="handleBan" label="确认封禁" />
          <BaseButton variant="outline" @click="showBanModal = false" label="取消" />
        </template>
      </Modal>

      <!-- Pardon Confirmation Modal -->
      <Modal :show="showPardonModal" title="解除封禁" @close="showPardonModal = false">
        <div class="sm:flex sm:items-center">
          <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
            <UserCheck class="h-6 w-6 text-green-600" />
          </div>
          <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <div class="mt-2">
              <p class="text-sm text-gray-500">
                您确定要解除对用户 <span class="font-bold text-gray-900">{{ selectedUser?.username }}</span> 的封禁吗？
              </p>
            </div>
          </div>
        </div>
        <template #footer>
          <BaseButton variant="primary" @click="handlePardon" label="确认解除" />
          <BaseButton variant="outline" @click="showPardonModal = false" label="取消" />
        </template>
      </Modal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import NavBar from '../components/NavBar.vue';
import BaseCard from '../components/BaseCard.vue';
import BaseButton from '../components/BaseButton.vue';
import BaseInput from '../components/BaseInput.vue';
import Modal from '../components/Modal.vue';
import api from '../api';
import { useToastStore } from '../stores/toast';
import { useAuthStore } from '../stores/auth';
import { Edit2, KeyRound, RotateCw, Loader2, Users, Trash2, ChevronDown, Check, Ban, UserCheck } from 'lucide-vue-next';
import { formatStatus, formatRole } from '../utils/formatters';

interface User {
  username: string;
  nickname: string;
  email: string;
  role: string;
  status: string;
  twoFactorEnabled: boolean;
}

const users = ref<User[]>([]);
const showEditModal = ref(false);
const showPasswordModal = ref(false);
const showDeleteModal = ref(false);
const showBanModal = ref(false);
const showPardonModal = ref(false);
const showRoleDropdown = ref(false);
const selectedUser = ref<User | null>(null);
const loading = ref(false);
const toast = useToastStore();
const auth = useAuthStore();

const getAvatarChar = (user: User) => {
  const name = user.nickname || user.username || '?';
  return name.charAt(0).toUpperCase();
};

const getAvatarColor = (user: User) => {
  const name = user.nickname || user.username || '';
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
};

const editForm = ref({
  nickname: '',
  email: '',
  role: 'USER'
});

const selectRole = (role: string) => {
  editForm.value.role = role;
  showRoleDropdown.value = false;
};

const passwordForm = ref({
  newPassword: '',
  confirmPassword: ''
});

const fetchUsers = async () => {
  loading.value = true;
  const minTimer = new Promise(resolve => setTimeout(resolve, 600));
  try {
    const data = await api.get<User[]>('/users');
    users.value = data;
    await minTimer;
  } catch (error: any) {
    toast.error('获取用户列表失败', error.message);
  } finally {
    loading.value = false;
  }
};

const roleClass = (role: string) => {
  return role === 'ADMIN' 
    ? 'bg-purple-100 text-purple-800' 
    : 'bg-blue-100 text-blue-800';
};


const openEdit = (user: User) => {
  selectedUser.value = user;
  editForm.value.nickname = user.nickname || '';
  editForm.value.email = user.email;
  editForm.value.role = user.role;
  showEditModal.value = true;
};

const closeEdit = () => {
  showEditModal.value = false;
  showRoleDropdown.value = false;
  selectedUser.value = null;
};

const saveEdit = async () => {
  if (!selectedUser.value) return;
  try {
    // Update Nickname
    if (editForm.value.nickname !== (selectedUser.value.nickname || '')) {
      await api.put(`/users/${selectedUser.value.username}/nickname`, { nickname: editForm.value.nickname });
    }
    // Update Role
    if (editForm.value.role !== selectedUser.value.role) {
      await api.put(`/users/${selectedUser.value.username}/role`, { role: editForm.value.role });
    }
    // Update Email
    if (editForm.value.email !== selectedUser.value.email) {
      await api.put(`/users/${selectedUser.value.username}/email`, { 
        newEmail: editForm.value.email,
        verificationCode: '' // Admin override
      });
    }
    toast.success('用户更新成功');
    closeEdit();
    fetchUsers();
  } catch (error: any) {
    toast.error('更新用户失败', error.message);
    console.error(error);
  }
};

const openPassword = (user: User) => {
  selectedUser.value = user;
  passwordForm.value.newPassword = '';
  passwordForm.value.confirmPassword = '';
  showPasswordModal.value = true;
};

const closePassword = () => {
  showPasswordModal.value = false;
  selectedUser.value = null;
};

const savePassword = async () => {
  if (!selectedUser.value) return;

  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    toast.error('两次输入的密码不一致');
    return;
  }

  try {
    await api.put(`/users/${selectedUser.value.username}/password`, {
      oldPassword: '', // Not needed for admin reset
      newPassword: passwordForm.value.newPassword
    });
    toast.success('密码重置成功');
    closePassword();
  } catch (error: any) {
    toast.error('重置密码失败', error.message);
    console.error(error);
  }
};

const confirmBan = (user: User) => {
  selectedUser.value = user;
  showBanModal.value = true;
};

const handleBan = async () => {
  if (!selectedUser.value) return;
  try {
    await api.put(`/users/${selectedUser.value.username}/status`, { status: 'BANNED' });
    toast.success('用户已封禁');
    showBanModal.value = false;
    fetchUsers();
  } catch (error: any) {
    toast.error('封禁失败', error.message);
    console.error(error);
  }
};

const confirmPardon = (user: User) => {
  selectedUser.value = user;
  showPardonModal.value = true;
};

const handlePardon = async () => {
  if (!selectedUser.value) return;
  try {
    await api.put(`/users/${selectedUser.value.username}/status`, { status: 'ACTIVE' });
    toast.success('用户封禁已解除');
    showPardonModal.value = false;
    fetchUsers();
  } catch (error: any) {
    toast.error('解除封禁失败', error.message);
    console.error(error);
  }
};

const confirmDelete = (user: User) => {
  selectedUser.value = user;
  showDeleteModal.value = true;
};

const handleDelete = async () => {
  if (!selectedUser.value) return;
  try {
    await api.delete(`/users/${selectedUser.value.username}`);
    toast.success('用户已删除');
    showDeleteModal.value = false;
    fetchUsers();
  } catch (error: any) {
    toast.error('删除用户失败', error.message);
    console.error(error);
  }
};

onMounted(() => {
  fetchUsers();
});
</script>
