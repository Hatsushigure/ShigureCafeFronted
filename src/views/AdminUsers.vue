<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <NavBar />
    <main class="flex-grow container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">User Management</h1>
      
      <div class="bg-white shadow rounded-lg overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="user in users" :key="user.username">
              <td class="px-6 py-4 whitespace-nowrap">{{ user.username }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ user.email }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="roleClass(user.role)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ user.role }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button @click="openEdit(user)" class="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                <button @click="openPassword(user)" class="text-red-600 hover:text-red-900">Reset Password</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>

    <!-- Edit User Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div class="bg-white p-8 rounded-lg shadow-xl w-96">
        <h2 class="text-xl font-bold mb-4">Edit User: {{ selectedUser?.username }}</h2>
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2">Email</label>
          <input v-model="editForm.email" type="email" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
        </div>
        <div class="mb-6">
          <label class="block text-gray-700 text-sm font-bold mb-2">Role</label>
          <select v-model="editForm.role" class="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
        <div class="flex justify-end">
          <button @click="closeEdit" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2">Cancel</button>
          <button @click="saveEdit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Save</button>
        </div>
      </div>
    </div>
    
    <!-- Reset Password Modal -->
    <div v-if="showPasswordModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div class="bg-white p-8 rounded-lg shadow-xl w-96">
        <h2 class="text-xl font-bold mb-4">Reset Password: {{ selectedUser?.username }}</h2>
        <div class="mb-6">
          <label class="block text-gray-700 text-sm font-bold mb-2">New Password</label>
          <input v-model="passwordForm.newPassword" type="password" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
        </div>
        <div class="flex justify-end">
          <button @click="closePassword" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2">Cancel</button>
          <button @click="savePassword" class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Reset</button>
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

interface User {
  username: string;
  email: string;
  role: string;
}

const users = ref<User[]>([]);
const showEditModal = ref(false);
const showPasswordModal = ref(false);
const selectedUser = ref<User | null>(null);
const toast = useToastStore();

const editForm = ref({
  email: '',
  role: 'USER'
});

const passwordForm = ref({
  newPassword: ''
});

const fetchUsers = async () => {
  try {
    const { data } = await api.get('/users');
    users.value = data;
  } catch (error) {
    toast.error('Failed to load users');
  }
};

const roleClass = (role: string) => {
  return role === 'ADMIN' 
    ? 'bg-red-100 text-red-800' 
    : 'bg-green-100 text-green-800';
};

const openEdit = (user: User) => {
  selectedUser.value = user;
  editForm.value.email = user.email;
  editForm.value.role = user.role;
  showEditModal.value = true;
};

const closeEdit = () => {
  showEditModal.value = false;
  selectedUser.value = null;
};

const saveEdit = async () => {
  if (!selectedUser.value) return;
  try {
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
    toast.success('User updated successfully');
    closeEdit();
    fetchUsers();
  } catch (error) {
    toast.error('Failed to update user');
    console.error(error);
  }
};

const openPassword = (user: User) => {
  selectedUser.value = user;
  passwordForm.value.newPassword = '';
  showPasswordModal.value = true;
};

const closePassword = () => {
  showPasswordModal.value = false;
  selectedUser.value = null;
};

const savePassword = async () => {
  if (!selectedUser.value) return;
  try {
    await api.put(`/users/${selectedUser.value.username}/password`, {
      oldPassword: '', // Not needed for admin reset
      newPassword: passwordForm.value.newPassword
    });
    toast.success('Password reset successfully');
    closePassword();
  } catch (error) {
    toast.error('Failed to reset password');
    console.error(error);
  }
};

onMounted(() => {
  fetchUsers();
});
</script>
