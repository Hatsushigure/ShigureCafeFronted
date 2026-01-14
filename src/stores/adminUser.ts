import { defineStore } from 'pinia';
import api from '../api';
import { useSystemStore } from './system';
import { useToastStore } from './toast';

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
    const globalLastUpdated = localStorage.getItem('admin_users_global_last_updated');

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
      globalLastUpdated: globalLastUpdated ? parseInt(globalLastUpdated) : 0,
      currentPage: pag.currentPage,
      pageSize: pag.pageSize,
      totalElements: pag.totalElements,
      totalPages: pag.totalPages,
      fetchCount: 0,
      fetchPromises: {} as Record<string, Promise<void>>,
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
      const systemStore = useSystemStore();
      const pageNum = page;
      const sizeNum = size;

      // 1. If we have cache and it's not a forced refresh, switch immediately
      if (!force && this.usersMap[pageNum]) {
        this.currentPage = pageNum;
        
        // Background check for updates - Fire and forget
        systemStore.fetchUpdates().then(updates => {
          if (updates.userLastUpdated > this.globalLastUpdated) {
            this.performFetchUsers(pageNum, sizeNum);
          }
        }).catch(() => {});
        
        return;
      }

      await this.performFetchUsers(pageNum, sizeNum, force);
    },
    async performFetchUsers(pageNum: number, sizeNum: number, force: boolean = false) {
      const cacheKey = `${pageNum}-${sizeNum}`;
      if (this.fetchPromises[cacheKey]) {
        return this.fetchPromises[cacheKey];
      }

      const systemStore = useSystemStore();
      const toastStore = useToastStore();
      this.loading = true;
      
      const minDelay = 1000;

      this.fetchPromises[cacheKey] = (async () => {
        try {
          const [data] = await Promise.all([
            api.get<PagedResponse<User>>('/users', {
              params: { page: pageNum, size: sizeNum }
            }),
            new Promise(resolve => setTimeout(resolve, minDelay))
          ]);
          
          if (force || systemStore.updates.userLastUpdated > this.globalLastUpdated) {
            this.usersMap = {};
          }

          this.usersMap[pageNum] = data.content;
          this.currentPage = data.pageNumber;
          this.pageSize = data.pageSize;
          this.totalElements = data.totalElements;
          this.totalPages = data.totalPages;
          
          this.globalLastUpdated = data.timestamp;
          this.fetchCount++;
          
          this.saveToLocalStorage();
        } catch (error: any) {
          toastStore.error('加载用户列表失败', error.message);
        } finally {
          this.loading = false;
          delete this.fetchPromises[cacheKey];
        }
      })();

      return this.fetchPromises[cacheKey];
    },
    saveToLocalStorage() {
      localStorage.setItem('admin_users_cache', JSON.stringify(this.usersMap));
      localStorage.setItem('admin_users_global_last_updated', this.globalLastUpdated.toString());
      localStorage.setItem('admin_users_pagination', JSON.stringify(this.pagination));
    },
    clearCache() {
      this.usersMap = {};
      this.globalLastUpdated = 0;
      this.currentPage = 0;
      this.pageSize = 10;
      this.totalElements = 0;
      this.totalPages = 0;
      localStorage.removeItem('admin_users_cache');
      localStorage.removeItem('admin_users_pagination');
      localStorage.removeItem('admin_users_global_last_updated');
    }
  }
});
