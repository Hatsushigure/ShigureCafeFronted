<template>
  <div class="min-h-screen bg-gray-50">
    <NavBar />

    <div class="py-10 transition-all duration-500 ease-in-out">
      <header>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <h1 
            v-if="!isSearchExpanded"
            class="text-2xl sm:text-3xl font-extrabold leading-tight text-gray-900 tracking-tight animate-slide-up"
          >
            用户管理
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
                class="sm:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors animate-slide-up animate-delay-50"
              >
                <Search class="h-5 w-5" />
              </button>

              <!-- Search Input Container -->
              <div 
                class="relative transition-all duration-300 ease-in-out animate-slide-up animate-delay-50"
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
                  placeholder="搜索用户名/邮箱/MC..."
                  class="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:border-blue-500 sm:text-sm transition-all duration-200"
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
            <BaseButton 
              v-show="!isSearchExpanded"
              variant="secondary"
              @click="fetchUsers(0, true)" 
              :loading="adminUserStore.loading"
              class="animate-slide-up animate-delay-50"
            >
              <RotateCw v-if="!adminUserStore.loading" class="h-4 w-4 sm:mr-2" />
              <span class="hidden sm:inline">刷新列表</span>
            </BaseButton>
          </div>
        </div>
      </header>
      
      <main>
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8 mt-8">
          <div class="px-4 sm:px-0">
            <BaseCard body-class="p-0 overflow-hidden" class="animate-slide-up animate-delay-100">
              <Transition name="fade-slide" mode="out-in">
                <div 
                  :key="filteredUsers.length > 0 ? `data-${adminUserStore.pagination.currentPage}-${searchQuery}` : (adminUserStore.loading ? 'loading' : 'empty')"
                  class="min-h-[400px]"
                >
                  <!-- Loading State (only if no cache) -->
                  <div v-if="adminUserStore.loading && adminUserStore.users.length === 0" class="p-12 flex justify-center items-center text-gray-400">
                    <Loader2 class="h-8 w-8 animate-spin" />
                  </div>

                  <!-- Empty State -->
                  <div v-else-if="filteredUsers.length === 0" class="p-12 text-center text-gray-500 flex flex-col items-center">
                    <Users class="h-12 w-12 text-gray-300 mb-3" />
                    <p>{{ searchQuery ? '未找到匹配的记录' : '暂无用户数据' }}</p>
                  </div>

                  <!-- Users Table -->
                  <div v-else class="relative">
                    <!-- Loading overlay for refresh -->
                    <div v-if="adminUserStore.loading" class="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-10 flex items-center justify-center transition-all duration-300">
                      <Loader2 class="h-8 w-8 animate-spin text-indigo-500" />
                    </div>

                    <CustomScrollContainer>
                      <table class="min-w-full divide-y divide-gray-200">
                      <thead class="bg-gray-50/50">
                        <tr>
                          <th scope="col" class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用户</th>
                          <th scope="col" class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">电子邮箱</th>
                          <th scope="col" class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Minecraft</th>
                          <th scope="col" class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用户角色</th>
                          <th scope="col" class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">双重验证</th>
                          <th scope="col" class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                          <th scope="col" class="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                        </tr>
                      </thead>
                      <tbody class="bg-white divide-y divide-gray-100">
                        <tr v-for="user in filteredUsers" :key="user.username" class="hover:bg-gray-50/80 transition-colors duration-150">
                          <td class="px-6 py-4 whitespace-nowrap">
                            <div class="flex items-center">
                              <div 
                                :class="[getAvatarColor(user), 'h-9 w-9 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm border-2 border-white ring-2 ring-gray-50 flex-shrink-0']"
                              >
                                {{ getAvatarChar(user) }}
                              </div>
                              <div class="ml-3">
                                <div class="text-sm font-medium text-gray-900" :title="user.nickname || '未设置昵称'">{{ truncateText(user.nickname || '未设置昵称') }}</div>
                                <div class="text-xs text-gray-500" :title="'@' + user.username">@{{ truncateText(user.username) }}</div>
                              </div>
                            </div>
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500" :title="user.email">{{ truncateText(user.email) }}</td>
                          <td class="px-6 py-4 whitespace-nowrap">
                            <div v-if="user.minecraftUuid" class="flex flex-col">
                              <span class="text-sm font-medium text-gray-900">{{ user.minecraftUsername }}</span>
                              <span class="text-xs text-gray-400 font-mono">{{ user.minecraftUuid }}</span>
                            </div>
                            <span v-else class="text-xs text-gray-400 italic">未绑定</span>
                          </td>
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
                            <button v-if="user.twoFactorEnabled" @click="confirmReset2FA(user)" class="text-yellow-600 hover:text-yellow-900 bg-yellow-50 hover:bg-yellow-100 p-1.5 rounded-md transition-colors" title="重置双重验证">
                              <ShieldOff class="h-4 w-4" />
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
                    </CustomScrollContainer>
                  </div>
                </div>
              </Transition>

              <!-- Pagination -->
              <Pagination 
                v-if="filteredUsers.length > 0"
                :current-page="searchQuery ? 0 : adminUserStore.pagination.currentPage"
                :total-pages="searchQuery ? Math.ceil(filteredUsers.length / adminUserStore.pagination.pageSize) : adminUserStore.pagination.totalPages"
                :total-elements="searchQuery ? filteredUsers.length : adminUserStore.pagination.totalElements"
                :page-size="adminUserStore.pagination.pageSize"
                @page-change="handlePageChange"
                class="bg-gray-50/50 border-t border-gray-100"
              />
            </BaseCard>
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
                class="relative w-full bg-white/50 border border-gray-300 rounded-xl shadow-sm pl-4 pr-10 py-2.5 text-left cursor-default focus:outline-none focus:border-blue-500 sm:text-sm transition-all duration-200"
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

      <!-- Reset 2FA Confirmation Modal -->
      <Modal :show="showReset2FAModal" title="重置双重验证" @close="showReset2FAModal = false">
        <div class="sm:flex sm:items-center">
          <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 sm:mx-0 sm:h-10 sm:w-10">
            <ShieldOff class="h-6 w-6 text-yellow-600" />
          </div>
          <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <div class="mt-2">
              <p class="text-sm text-gray-500">
                您确定要重置用户 <span class="font-bold text-gray-900">{{ selectedUser?.username }}</span> 的双重验证吗？此操作将关闭该用户的所有双重验证方式（包括邮箱验证和身份验证器）。
              </p>
            </div>
          </div>
        </div>
        <template #footer>
          <BaseButton variant="warning" @click="handleReset2FA" label="确认重置" />
          <BaseButton variant="outline" @click="showReset2FAModal = false" label="取消" />
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
import { ref, onMounted, computed, watch, nextTick } from 'vue';
import NavBar from '../components/NavBar.vue';
import BaseCard from '../components/BaseCard.vue';
import BaseButton from '../components/BaseButton.vue';
import BaseInput from '../components/BaseInput.vue';
import Modal from '../components/Modal.vue';
import Pagination from '../components/Pagination.vue';
import CustomScrollContainer from '../components/CustomScrollContainer.vue';
import api from '../api';
import { useToastStore } from '../stores/toast';
import { useAuthStore } from '../stores/auth';
import { useAdminUserStore } from '../stores/adminUser';
import { Edit2, KeyRound, RotateCw, Loader2, Users, Trash2, ChevronDown, Check, Ban, UserCheck, ShieldOff, Search, X } from 'lucide-vue-next';
import { formatStatus, formatRole, truncateText } from '../utils/formatters';

interface User {
  username: string;
  nickname: string;
  email: string;
  role: string;
  status: string;
  twoFactorEnabled: boolean;
  email2faEnabled: boolean;
  totpEnabled: boolean;
  minecraftUuid?: string;
  minecraftUsername?: string;
}

const adminUserStore = useAdminUserStore();
const searchQuery = ref('');
const isSearchExpanded = ref(false);
const searchInput = ref<HTMLInputElement | null>(null);
const showEditModal = ref(false);
const showPasswordModal = ref(false);
const showDeleteModal = ref(false);
const showBanModal = ref(false);
const showPardonModal = ref(false);
const showReset2FAModal = ref(false);
const showRoleDropdown = ref(false);
const selectedUser = ref<User | null>(null);
const toast = useToastStore();
const auth = useAuthStore();

watch(isSearchExpanded, (val) => {
  if (val) {
    nextTick(() => {
      searchInput.value?.focus();
    });
  }
});

const filteredUsers = computed(() => {
  const users = adminUserStore.users;
  if (!searchQuery.value) return users;
  const q = searchQuery.value.toLowerCase();
  return users.filter(user => 
    user.username.toLowerCase().includes(q) ||
    user.nickname?.toLowerCase().includes(q) ||
    user.email.toLowerCase().includes(q) ||
    user.minecraftUsername?.toLowerCase().includes(q) ||
    user.minecraftUuid?.toLowerCase().includes(q)
  );
});

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

const fetchUsers = async (page?: number, force: boolean = false) => {
  const targetPage = typeof page === 'number' ? page : adminUserStore.pagination.currentPage;
  try {
    await adminUserStore.fetchUsers(targetPage, 10, force);
  } catch (error: any) {
    toast.error('获取用户列表失败', error.message);
  }
};

const handlePageChange = (page: number) => {
  const isPageChange = page !== adminUserStore.pagination.currentPage;
  if (isPageChange) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  fetchUsers(page);
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
  }
};

const confirmReset2FA = (user: User) => {
  selectedUser.value = user;
  showReset2FAModal.value = true;
};

const handleReset2FA = async () => {
  if (!selectedUser.value) return;
  try {
    await api.delete(`/users/${selectedUser.value.username}/2fa`);
    toast.success('双重验证已重置');
    showReset2FAModal.value = false;
    fetchUsers();
  } catch (error: any) {
    toast.error('重置双重验证失败', error.message);
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
  }
};

onMounted(() => {
  fetchUsers();
});
</script>
