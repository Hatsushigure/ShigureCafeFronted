import { defineStore } from 'pinia';
import api from '../api';
import { useSystemStore } from './system';
import { useToastStore } from './toast';

export interface Audit {
  username: string;
  nickname: string;
  email: string;
  status: string;
  auditCode: string;
  isExpired: boolean;
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

export const useAdminAuditStore = defineStore('adminAudit', {
  state: () => {
    const cached = localStorage.getItem('admin_audits_cache');
    const pagination = localStorage.getItem('admin_audits_pagination');
    const globalLastUpdated = localStorage.getItem('admin_audits_global_last_updated');

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
      auditsMap: parsePotentialMap(cached) as Record<number, Audit[]>,
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
    audits: (state) => state.auditsMap[state.currentPage] || [],
    pagination: (state) => ({
      currentPage: state.currentPage,
      pageSize: state.pageSize,
      totalElements: state.totalElements,
      totalPages: state.totalPages,
    })
  },
  actions: {
    async fetchAudits(page = 0, size = 10, force = false) {
      const systemStore = useSystemStore();
      const pageNum = page;
      const sizeNum = size;

      // 1. If we have cache and it's not a forced refresh, switch immediately
      if (!force && this.auditsMap[pageNum]) {
        this.currentPage = pageNum;
        
        // Background check for updates - Fire and forget
        systemStore.fetchUpdates().then(updates => {
          if (updates.auditLastUpdated > this.globalLastUpdated) {
            this.performFetchAudits(pageNum, sizeNum);
          }
        }).catch(() => {});
        
        return; // Return immediately to the caller
      }

      await this.performFetchAudits(pageNum, sizeNum, force);
    },
    async performFetchAudits(pageNum: number, sizeNum: number, force: boolean = false) {
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
          const params: any = {
              page: pageNum,
              size: sizeNum
          };

          const [data] = await Promise.all([
            api.get<PagedResponse<Audit>>('/registrations', {
              params
            }),
            new Promise(resolve => setTimeout(resolve, minDelay))
          ]);
          
          if (force || systemStore.updates.auditLastUpdated > this.globalLastUpdated) {
            this.auditsMap = {};
          }

          this.auditsMap[pageNum] = data.content;
          this.currentPage = data.pageNumber;
          this.pageSize = data.pageSize;
          this.totalElements = data.totalElements;
          this.totalPages = data.totalPages;
          
          this.globalLastUpdated = data.timestamp;
          this.fetchCount++;
          
          this.saveToLocalStorage();
        } catch (error: any) {
          toastStore.error('加载审核列表失败', error.message);
        } finally {
          this.loading = false;
          delete this.fetchPromises[cacheKey];
        }
      })();

      return this.fetchPromises[cacheKey];
    },
    saveToLocalStorage() {
      localStorage.setItem('admin_audits_cache', JSON.stringify(this.auditsMap));
      localStorage.setItem('admin_audits_global_last_updated', this.globalLastUpdated.toString());
      localStorage.setItem('admin_audits_pagination', JSON.stringify(this.pagination));
    },
    clearCache() {
      this.auditsMap = {};
      this.globalLastUpdated = 0;
      this.currentPage = 0;
      this.pageSize = 10;
      this.totalElements = 0;
      this.totalPages = 0;
      localStorage.removeItem('admin_audits_cache');
      localStorage.removeItem('admin_audits_pagination');
      localStorage.removeItem('admin_audits_global_last_updated');
    }
  }
});
