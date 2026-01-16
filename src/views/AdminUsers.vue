<template>
  <div class="min-h-screen bg-gray-50">
    <NavBar />

    <div class="py-10 transition-all duration-500 ease-in-out">
      <AdminPageHeader :title="t('admin-users.title')" v-model="searchQuery" :loading="userStore.loading"
        :search-placeholder="t('admin-users.search-placeholder')" @refresh="fetchUsers(0, true)" />

      <main>
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8 mt-8">
          <div class="px-4 sm:px-0">
            <BaseCard body-class="p-0 overflow-hidden" class="animate-slide-up animate-delay-100">
              <transition name="fade-slide" mode="out-in">
                <div
                  :key="filteredUsers.length > 0 ? `users-${userStore.currentPage}-${searchQuery}` : (userStore.loading ? 'loading' : 'empty')"
                  class="min-h-[300px] flex flex-col">
                  <!-- Loading State (only if no cache) -->
                  <div v-if="userStore.loading && filteredUsers.length === 0"
                    class="flex-1 flex justify-center items-center text-gray-400">
                    <Loader2 class="h-8 w-8 animate-spin" />
                  </div>

                  <!-- Empty State -->
                  <div v-else-if="filteredUsers.length === 0"
                    class="flex-1 text-center text-gray-500 flex flex-col items-center justify-center">
                    <Users class="h-12 w-12 text-gray-300 mb-3" />
                    <p>{{ searchQuery ? t('admin-users.no-results') : t('admin-users.no-data') }}</p>
                  </div>

                  <!-- Users Table -->
                  <div v-else class="relative flex-1 flex flex-col">
                    <!-- Loading overlay for refresh -->
                    <div v-if="userStore.loading"
                      class="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-10 flex items-center justify-center transition-all duration-300">
                      <Loader2 class="h-8 w-8 animate-spin text-indigo-500" />
                    </div>

                    <CustomScrollContainer class="flex-1">
                      <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50/50">
                          <tr>
                            <th scope="col"
                              class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{
                                t('admin-users.table.user') }}</th>
                            <th scope="col"
                              class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{
                                t('admin-users.table.email') }}</th>
                            <th scope="col"
                              class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{
                                t('admin-users.table.minecraft') }}</th>
                            <th scope="col"
                              class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{
                                t('admin-users.table.role') }}</th>
                            <th scope="col"
                              class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{
                                t('admin-users.table.2fa') }}</th>
                            <th scope="col"
                              class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{
                                t('admin-users.table.status') }}</th>
                            <th scope="col"
                              class="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{{
                                t('admin-users.table.actions') }}</th>
                          </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-100">
                          <tr v-for="user in filteredUsers" :key="user.username"
                            class="hover:bg-gray-50/80 transition-colors duration-150">
                            <td class="px-6 py-4 whitespace-nowrap">
                              <div class="flex items-center">
                                <UserAvatar :name="user.nickname || user.username" :src="user.avatarUrl" />
                                <div class="ml-3">
                                  <div class="text-sm font-medium text-gray-900"
                                    :title="user.nickname || t('admin-users.no-nickname')">{{ truncateText(user.nickname
                                    || t('admin-users.no-nickname')) }}</div>
                                  <div class="text-xs text-gray-500" :title="'@' + user.username">@{{
                                    truncateText(user.username) }}</div>
                                </div>
                              </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500" :title="user.email">{{
                              truncateText(user.email) }}</td>
                            <td class="px-6 py-4 whitespace-nowrap">
                              <div v-if="user.minecraftUuid" class="flex flex-col">
                                <span class="text-sm font-medium text-gray-900">{{ user.minecraftUsername }}</span>
                                <span class="text-xs text-gray-400 font-mono">{{ user.minecraftUuid }}</span>
                              </div>
                              <span v-else class="text-xs text-gray-400 italic">{{ t('admin-users.not-bound') }}</span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                              <RoleBadge :role="user.role!" />
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                              <span :class="[
                                'px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full',
                                user.twoFactorEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              ]">
                                {{ user.twoFactorEnabled ? t('admin-users.enabled') : t('admin-users.disabled') }}
                              </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                              <StatusBadge :status="user.status!" />
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                              <button @click="openEdit(user)"
                                class="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 p-1.5 rounded-md transition-colors"
                                :title="t('admin-users.actions.edit')">
                                <Edit2 class="h-4 w-4" />
                              </button>
                              <button @click="openPassword(user)"
                                class="text-orange-600 hover:text-orange-900 bg-orange-50 hover:bg-orange-100 p-1.5 rounded-md transition-colors"
                                :title="t('admin-users.actions.reset-password')">
                                <KeyRound class="h-4 w-4" />
                              </button>
                              <button v-if="user.twoFactorEnabled" @click="confirmReset2FA(user)"
                                class="text-yellow-600 hover:text-yellow-900 bg-yellow-50 hover:bg-yellow-100 p-1.5 rounded-md transition-colors"
                                :title="t('admin-users.actions.reset2fa')">
                                <ShieldOff class="h-4 w-4" />
                              </button>
                              <button v-if="user.username !== auth.user?.username && user.status !== 'BANNED'"
                                @click="confirmBan(user)"
                                class="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-1.5 rounded-md transition-colors"
                                :title="t('admin-users.actions.ban')">
                                <Ban class="h-4 w-4" />
                              </button>
                              <button v-if="user.status === 'BANNED'" @click="confirmPardon(user)"
                                class="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 p-1.5 rounded-md transition-colors"
                                :title="t('admin-users.actions.pardon')">
                                <UserCheck class="h-4 w-4" />
                              </button>
                              <button v-if="user.username !== auth.user?.username" @click="confirmDelete(user)"
                                class="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-1.5 rounded-md transition-colors"
                                :title="t('admin-users.actions.delete')">
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
              <Pagination v-if="filteredUsers.length > 0"
                :current-page="searchQuery ? 0 : userStore.pagination.currentPage"
                :total-pages="searchQuery ? Math.ceil(filteredUsers.length / userStore.pagination.pageSize) : userStore.pagination.totalPages"
                :total-elements="searchQuery ? filteredUsers.length : userStore.pagination.totalElements"
                :page-size="userStore.pagination.pageSize" @page-change="handlePageChange"
                class="bg-gray-50/50 border-t border-gray-100" />
            </BaseCard>
          </div>
        </div>
      </main>

      <!-- Edit User Modal -->
      <Modal :show="showEditModal" :title="t('admin-users.modals.edit-title', { username: selectedUser?.username })"
        @close="closeEdit">
        <div class="mt-4 space-y-4">
          <BaseInput v-model="editForm.nickname" :label="t('admin-users.fields.nickname')"
            :placeholder="t('admin-users.no-nickname')" />
          <BaseInput v-model="editForm.email" :label="t('admin-users.fields.email')" type="email" />
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('admin-users.fields.role') }}</label>
            <div class="relative">
              <button @click="showRoleDropdown = !showRoleDropdown" type="button"
                class="relative w-full bg-white/50 border border-gray-300 rounded-xl shadow-sm pl-4 pr-10 py-2.5 text-left cursor-default focus:outline-none focus:border-blue-500 sm:text-sm transition-all duration-200">
                <span class="block truncate font-medium text-gray-900">{{ formatRole(editForm.role) }}</span>
                <span class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ChevronDown class="h-4 w-4 text-gray-400 transition-transform duration-300"
                    :class="{ 'rotate-180': showRoleDropdown }" />
                </span>
              </button>

              <transition enter-active-class="transition ease-out duration-200"
                enter-from-class="opacity-0 scale-95 -translate-y-2"
                enter-to-class="opacity-100 scale-100 translate-y-0"
                leave-active-class="transition ease-in duration-150"
                leave-from-class="opacity-100 scale-100 translate-y-0"
                leave-to-class="opacity-0 scale-95 -translate-y-2">
                <div v-if="showRoleDropdown"
                  class="absolute z-60 mt-1 w-full bg-white/95 backdrop-blur-lg shadow-xl max-h-60 rounded-xl py-1 text-base overflow-auto focus:outline-none sm:text-sm border border-gray-100">
                  <div v-for="role in ['USER', 'ADMIN']" :key="role" @click="selectRole(role)"
                    class="cursor-pointer select-none relative py-2.5 pl-4 pr-9 hover:bg-blue-50 transition-colors"
                    :class="editForm.role === role ? 'text-blue-600 bg-blue-50/50' : 'text-gray-900'">
                    <span class="block truncate" :class="{ 'font-bold': editForm.role === role }">{{ formatRole(role)
                      }}</span>
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
          <BaseButton @click="saveEdit" :label="t('admin-users.buttons.save-changes')" />
          <BaseButton variant="outline" @click="closeEdit" :label="t('common.cancel')" />
        </template>
      </Modal>

      <!-- Reset Password Modal -->
      <Modal :show="showPasswordModal"
        :title="t('admin-users.modals.reset-password-title', { username: selectedUser?.username })"
        @close="closePassword">
        <div class="mt-4 space-y-4">
          <BaseInput v-model="passwordForm.newPassword" :label="t('admin-users.fields.new-password')" type="password"
            :placeholder="t('admin-users.placeholders.new-password')" />
          <BaseInput v-model="passwordForm.confirmPassword" :label="t('admin-users.fields.confirm-password')"
            type="password" :placeholder="t('admin-users.placeholders.confirm-password')" />
          <p class="mt-2 text-xs text-gray-500">{{ t('admin-users.modals.reset-password-warning') }}</p>
        </div>
        <template #footer>
          <BaseButton variant="danger" @click="savePassword" :label="t('admin-users.buttons.confirm-reset')" />
          <BaseButton variant="outline" @click="closePassword" :label="t('common.cancel')" />
        </template>
      </Modal>

      <!-- Delete Confirmation Modal -->
      <Modal :show="showDeleteModal" :title="t('admin-users.modals.delete-title')" @close="showDeleteModal = false">
        <div class="sm:flex sm:items-center">
          <div
            class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
            <Trash2 class="h-6 w-6 text-red-600" />
          </div>
          <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <div class="mt-2">
              <p class="text-sm text-gray-500"
                v-html="t('admin-users.modals.delete-confirmation', { username: `<span class='font-bold text-gray-900'>${selectedUser?.username}</span>` })">
              </p>
            </div>
          </div>
        </div>
        <template #footer>
          <BaseButton variant="danger" @click="handleDelete" :label="t('admin-users.buttons.confirm-delete')" />
          <BaseButton variant="outline" @click="showDeleteModal = false" :label="t('common.cancel')" />
        </template>
      </Modal>

      <!-- Ban Confirmation Modal -->
      <Modal :show="showBanModal" :title="t('admin-users.modals.ban-title')" @close="showBanModal = false">
        <div class="sm:flex sm:items-center">
          <div
            class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
            <Ban class="h-6 w-6 text-red-600" />
          </div>
          <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <div class="mt-2">
              <p class="text-sm text-gray-500"
                v-html="t('admin-users.modals.ban-confirmation', { username: `<span class='font-bold text-gray-900'>${selectedUser?.username}</span>` })">
              </p>
            </div>
          </div>
        </div>
        <template #footer>
          <BaseButton variant="danger" @click="handleBan" :label="t('admin-users.buttons.confirm-ban')" />
          <BaseButton variant="outline" @click="showBanModal = false" :label="t('common.cancel')" />
        </template>
      </Modal>

      <!-- Reset 2FA Confirmation Modal -->
      <Modal :show="showReset2FAModal" :title="t('admin-users.modals.reset2fa-title')"
        @close="showReset2FAModal = false">
        <div class="sm:flex sm:items-center">
          <div
            class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 sm:mx-0 sm:h-10 sm:w-10">
            <ShieldOff class="h-6 w-6 text-yellow-600" />
          </div>
          <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <div class="mt-2">
              <p class="text-sm text-gray-500"
                v-html="t('admin-users.modals.reset2fa-confirmation', { username: `<span class='font-bold text-gray-900'>${selectedUser?.username}</span>` })">
              </p>
            </div>
          </div>
        </div>
        <template #footer>
          <BaseButton variant="warning" @click="handleReset2FA" :label="t('admin-users.buttons.confirm-reset')" />
          <BaseButton variant="outline" @click="showReset2FAModal = false" :label="t('common.cancel')" />
        </template>
      </Modal>

      <!-- Pardon Confirmation Modal -->
      <Modal :show="showPardonModal" :title="t('admin-users.modals.pardon-title')" @close="showPardonModal = false">
        <div class="sm:flex sm:items-center">
          <div
            class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
            <UserCheck class="h-6 w-6 text-green-600" />
          </div>
          <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <div class="mt-2">
              <p class="text-sm text-gray-500"
                v-html="t('admin-users.modals.pardon-confirmation', { username: `<span class='font-bold text-gray-900'>${selectedUser?.username}</span>` })">
              </p>
            </div>
          </div>
        </div>
        <template #footer>
          <BaseButton variant="primary" @click="handlePardon" :label="t('admin-users.buttons.confirm-pardon')" />
          <BaseButton variant="outline" @click="showPardonModal = false" :label="t('common.cancel')" />
        </template>
      </Modal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import NavBar from '../components/NavBar.vue';
import BaseCard from '../components/BaseCard.vue';
import BaseButton from '../components/BaseButton.vue';
import BaseInput from '../components/BaseInput.vue';
import Modal from '../components/Modal.vue';
import Pagination from '../components/Pagination.vue';
import CustomScrollContainer from '../components/CustomScrollContainer.vue';
import AdminPageHeader from '../components/AdminPageHeader.vue';
import UserAvatar from '../components/UserAvatar.vue';
import StatusBadge from '../components/StatusBadge.vue';
import RoleBadge from '../components/RoleBadge.vue';
import api from '../api';
import { useToastStore } from '../stores/toast';
import { useAuthStore } from '../stores/auth';
import { useUserStore, type User } from '../stores/user';
import { Edit2, KeyRound, Loader2, Users, Trash2, ChevronDown, Check, Ban, UserCheck, ShieldOff } from 'lucide-vue-next';
import { formatRole, truncateText } from '../utils/formatters';

const { t } = useI18n();
const userStore = useUserStore();
const searchQuery = ref('');
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

const filteredUsers = computed(() => {
  const users = userStore.adminUsers;
  if (!searchQuery.value) return users;
  const q = searchQuery.value.toLowerCase();
  return users.filter(user =>
    user.username.toLowerCase().includes(q) ||
    user.nickname?.toLowerCase().includes(q) ||
    user.email.toLowerCase().includes(q) ||
    (user.minecraftUsername && user.minecraftUsername.toLowerCase().includes(q)) ||
    (user.minecraftUuid && user.minecraftUuid.toLowerCase().includes(q))
  );
});

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
  const targetPage = typeof page === 'number' ? page : userStore.pagination.currentPage;
  try {
    await userStore.fetchAdminUsers(targetPage, 10, force);
  } catch (error: any) {
    toast.error(t('admin-users.messages.fetch-failed'), error.message);
  }
};

const handlePageChange = (page: number) => {
  const isPageChange = page !== userStore.pagination.currentPage;
  if (isPageChange) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  fetchUsers(page);
};

const openEdit = (user: User) => {
  selectedUser.value = user;
  editForm.value.nickname = user.nickname || '';
  editForm.value.email = user.email;
  editForm.value.role = user.role || 'USER';
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
    toast.success(t('admin-users.messages.update-success'));
    closeEdit();
    fetchUsers();
  } catch (error: any) {
    toast.error(t('admin-users.messages.update-failed'), error.message);
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
    toast.error(t('admin-users.messages.password-mismatch'));
    return;
  }

  try {
    await api.put(`/users/${selectedUser.value.username}/password`, {
      oldPassword: '', // Not needed for admin reset
      newPassword: passwordForm.value.newPassword
    });
    toast.success(t('admin-users.messages.reset-password-success'));
    closePassword();
  } catch (error: any) {
    toast.error(t('admin-users.messages.reset-password-failed'), error.message);
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
    toast.success(t('admin-users.messages.ban-success'));
    showBanModal.value = false;
    fetchUsers();
  } catch (error: any) {
    toast.error(t('admin-users.messages.ban-failed'), error.message);
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
    toast.success(t('admin-users.messages.reset2fa-success'));
    showReset2FAModal.value = false;
    fetchUsers();
  } catch (error: any) {
    toast.error(t('admin-users.messages.reset2fa-failed'), error.message);
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
    toast.success(t('admin-users.messages.pardon-success'));
    showPardonModal.value = false;
    fetchUsers();
  } catch (error: any) {
    toast.error(t('admin-users.messages.pardon-failed'), error.message);
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
    toast.success(t('admin-users.messages.delete-success'));
    showDeleteModal.value = false;
    fetchUsers();
  } catch (error: any) {
    toast.error(t('admin-users.messages.delete-failed'), error.message);
  }
};

onMounted(() => {
  fetchUsers();
});
</script>