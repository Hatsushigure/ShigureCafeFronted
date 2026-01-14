import { defineStore } from 'pinia';
import api from '../api';

export interface User {
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
  timestamp: number;
}

export const useAdminUserStore = defineStore('adminUser', {
  state: () => {
    const cached = localStorage.getItem('admin_users_cache');
    const pagination = localStorage.getItem('admin_users_pagination');
    const lastUpdated = localStorage.getItem('admin_users_last_updated');

    const parsePotentialMap = (data: string | null) => {
      if (!data) return {};
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          return Object.fromEntries(parsed);
        }
        return parsed;
      } catch (e) {
        return {};
      }
    };

    const pag = pagination ? JSON.parse(pagination) : {
      currentPage: 0,
      pageSize: 10,
      totalElements: 0,
      totalPages: 0
    };

    return {
      usersMap: parsePotentialMap(cached) as Record<number, User[]>,
      loading: false,
      lastUpdatedMap: parsePotentialMap(lastUpdated) as Record<number, number>,
      currentPage: pag.currentPage,
      pageSize: pag.pageSize,
      totalElements: pag.totalElements,
      totalPages: pag.totalPages,
    };
  },
  getters: {
    users: (state) => state.usersMap[state.currentPage] || [],
    pagination: (state) => ({
      currentPage: state.currentPage,
      pageSize: state.pageSize,
      totalElements: state.totalElements,
      totalPages: state.totalPages,
    })
  },
  actions: {
    async fetchUsers(page = 0, size = 10, force = false) {
      const pageNum = page;
      const sizeNum = size;

      this.loading = true;
      try {
        const params: any = { page: pageNum, size: sizeNum };
        if (!force && this.lastUpdatedMap[pageNum]) {
            params.t = this.lastUpdatedMap[pageNum];
        }

        const data = await api.get<PagedResponse<User>>('/users', {
          params
        });
        
        this.usersMap[pageNum] = data.content;
        this.currentPage = data.pageNumber;
        this.pageSize = data.pageSize;
        this.totalElements = data.totalElements;
        this.totalPages = data.totalPages;
        
        this.lastUpdatedMap[pageNum] = data.timestamp;
        
        this.saveToLocalStorage();
      } catch (error: any) {
        if (error.response && error.response.status === 304) {
             this.currentPage = pageNum;
             if (!this.usersMap[pageNum]) {
                this.usersMap[pageNum] = [];
             }
             return;
        }
        console.error('Failed to fetch users', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    saveToLocalStorage() {
      localStorage.setItem('admin_users_cache', JSON.stringify(this.usersMap));
      localStorage.setItem('admin_users_last_updated', JSON.stringify(this.lastUpdatedMap));
      localStorage.setItem('admin_users_pagination', JSON.stringify(this.pagination));
    },
    clearCache() {
      this.usersMap = {};
      this.lastUpdatedMap = {};
      this.currentPage = 0;
      this.pageSize = 10;
      this.totalElements = 0;
      this.totalPages = 0;
      localStorage.removeItem('admin_users_cache');
      localStorage.removeItem('admin_users_pagination');
      localStorage.removeItem('admin_users_last_updated');
    }
  }
});