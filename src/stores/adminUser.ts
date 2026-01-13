import { defineStore } from 'pinia';
import api from '../api';

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

interface PagedResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export const useAdminUserStore = defineStore('adminUser', {
  state: () => ({
    users: JSON.parse(localStorage.getItem('admin_users_cache') || '[]') as User[],
    pagination: JSON.parse(localStorage.getItem('admin_users_pagination') || '{"currentPage":0,"pageSize":10,"totalElements":0,"totalPages":0,"isLast":true}'),
    loading: false,
    lastUpdated: localStorage.getItem('admin_users_last_updated') || null,
  }),
  actions: {
    async fetchUsers(page = 0, size = 10) {
      this.loading = true;
      try {
        const data = await api.get<PagedResponse<User>>('/users', {
          params: { page, size }
        });
        
        this.users = data.content;
        this.pagination = {
          currentPage: data.pageNumber,
          pageSize: data.pageSize,
          totalElements: data.totalElements,
          totalPages: data.totalPages,
          isLast: data.last
        };
        
        this.lastUpdated = new Date().toISOString();
        
        // Cache the first page for immediate display on next visit
        if (page === 0) {
          localStorage.setItem('admin_users_cache', JSON.stringify(this.users));
          localStorage.setItem('admin_users_pagination', JSON.stringify(this.pagination));
          localStorage.setItem('admin_users_last_updated', this.lastUpdated);
        }
      } catch (error) {
        console.error('Failed to fetch users', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    clearCache() {
      this.users = [];
      this.lastUpdated = null;
      localStorage.removeItem('admin_users_cache');
      localStorage.removeItem('admin_users_pagination');
      localStorage.removeItem('admin_users_last_updated');
    }
  }
});
