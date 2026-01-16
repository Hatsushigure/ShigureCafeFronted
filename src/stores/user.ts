import { defineStore } from 'pinia';
import api from '../api';
import { useSystemStore } from './system';
import { useToastStore } from './toast';
import i18n from '../locales';

const { t } = i18n.global;

export interface User {
  username: string;
  nickname: string;
  email: string;
  role?: string;
  status?: string;
  twoFactorEnabled?: boolean;
  email2faEnabled?: boolean;
  totpEnabled?: boolean;
  avatarUrl?: string;
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

export const useUserStore = defineStore('user', {
  state: () => {
    const cachedProfiles = localStorage.getItem('user_profiles_cache');
    const cachedAdminPages = localStorage.getItem('user_admin_pages_cache');
    const pagination = localStorage.getItem('user_pagination');
    const globalLastUpdated = localStorage.getItem('user_global_last_updated');

    const pag = pagination ? JSON.parse(pagination) : {
      currentPage: 0,
      pageSize: 10,
      totalElements: 0,
      totalPages: 0
    };

    return {
      // Data records: username -> User object
      profiles: (cachedProfiles ? JSON.parse(cachedProfiles) : {}) as Record<string, User>,
      
      // Admin view mapping: pageNumber -> array of usernames
      adminPages: (cachedAdminPages ? JSON.parse(cachedAdminPages) : {}) as Record<number, string[]>,
      
      loading: false,
      globalLastUpdated: globalLastUpdated ? parseInt(globalLastUpdated) : 0,
      currentPage: pag.currentPage,
      pageSize: pag.pageSize,
      totalElements: pag.totalElements,
      totalPages: pag.totalPages,
      
      fetchPromises: {} as Record<string, Promise<any>>,
    };
  },
  getters: {
    // Get users for the current admin page
    adminUsers: (state): User[] => {
      const usernames = state.adminPages[state.currentPage] || [];
      return usernames.map(username => state.profiles[username]).filter((u): u is User => !!u);
    },
    pagination: (state) => ({
      currentPage: state.currentPage,
      pageSize: state.pageSize,
      totalElements: state.totalElements,
      totalPages: state.totalPages,
    })
  },
  actions: {
    /**
     * Fetch a single public user profile
     */
    async fetchProfile(username: string): Promise<User> {
      // If we have a profile with role/status, it's already a full profile, don't re-fetch unless needed
      if (this.profiles[username] && !this.isCacheExpired()) {
        return this.profiles[username];
      }

      const promiseKey = `profile-${username}`;
      if (this.fetchPromises[promiseKey]) {
        return this.fetchPromises[promiseKey];
      }

      this.fetchPromises[promiseKey] = (async () => {
        try {
          const data = await api.get<User>(`/users/${username}/public`);
          // Merge with existing data to keep admin fields if present
          this.profiles[username] = { ...this.profiles[username], ...data };
          this.saveToLocalStorage();
          return this.profiles[username];
        } catch (error) {
          console.error(`Failed to fetch profile for ${username}:`, error);
          throw error;
        } finally {
          delete this.fetchPromises[promiseKey];
        }
      })();

      return this.fetchPromises[promiseKey];
    },

    /**
     * Admin: Fetch paged users
     */
    async fetchAdminUsers(page = 0, size = 10, force = false) {
      const systemStore = useSystemStore();
      const pageNum = page;
      const sizeNum = size;

      // Check if we can use cache
      if (!force && this.adminPages[pageNum] && !this.isCacheExpired()) {
        this.currentPage = pageNum;
        
        // Background update check
        systemStore.fetchUpdates().then(updates => {
          if (updates.userLastUpdated > this.globalLastUpdated) {
            this.performFetchAdminUsers(pageNum, sizeNum);
          }
        }).catch(() => { });

        return;
      }

      await this.performFetchAdminUsers(pageNum, sizeNum, force);
    },

    async performFetchAdminUsers(pageNum: number, sizeNum: number, force: boolean = false) {
      const promiseKey = `admin-page-${pageNum}-${sizeNum}`;
      if (this.fetchPromises[promiseKey]) {
        return this.fetchPromises[promiseKey];
      }

      const systemStore = useSystemStore();
      const toastStore = useToastStore();
      this.loading = true;

      const minDelay = 500;

      this.fetchPromises[promiseKey] = (async () => {
        try {
          const [data] = await Promise.all([
            api.get<PagedResponse<User>>('/users', {
              params: { page: pageNum, size: sizeNum }
            }),
            new Promise(resolve => setTimeout(resolve, minDelay))
          ]);

          // If global update detected or forced, clear the page index (but keep profile data for other views)
          if (force || systemStore.updates.userLastUpdated > this.globalLastUpdated) {
            this.adminPages = {};
          }

          // Update profiles map with fresh data
          data.content.forEach(user => {
            this.profiles[user.username] = { ...this.profiles[user.username], ...user };
          });

          // Store only usernames for this page
          this.adminPages[pageNum] = data.content.map(u => u.username);
          
          this.currentPage = data.pageNumber;
          this.pageSize = data.pageSize;
          this.totalElements = data.totalElements;
          this.totalPages = data.totalPages;
          this.globalLastUpdated = data.timestamp;

          this.saveToLocalStorage();
        } catch (error: any) {
          toastStore.error(t('admin-users.messages.fetch-failed'), error.message);
        } finally {
          this.loading = false;
          delete this.fetchPromises[promiseKey];
        }
      })();

      return this.fetchPromises[promiseKey];
    },

    isCacheExpired() {
      const systemStore = useSystemStore();
      return systemStore.updates.userLastUpdated > this.globalLastUpdated;
    },

    saveToLocalStorage() {
      localStorage.setItem('user_profiles_cache', JSON.stringify(this.profiles));
      localStorage.setItem('user_admin_pages_cache', JSON.stringify(this.adminPages));
      localStorage.setItem('user_global_last_updated', this.globalLastUpdated.toString());
      localStorage.setItem('user_pagination', JSON.stringify(this.pagination));
    },

    clearCache() {
      this.profiles = {};
      this.adminPages = {};
      this.globalLastUpdated = 0;
      this.currentPage = 0;
      this.pageSize = 10;
      this.totalElements = 0;
      this.totalPages = 0;
      localStorage.removeItem('user_profiles_cache');
      localStorage.removeItem('user_admin_pages_cache');
      localStorage.removeItem('user_pagination');
      localStorage.removeItem('user_global_last_updated');
    }
  }
});