import { defineStore } from 'pinia';
import api from '../api';

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
    const lastUpdated = localStorage.getItem('admin_audits_last_updated');

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
      lastUpdatedMap: parsePotentialMap(lastUpdated) as Record<number, number>,
      currentPage: pag.currentPage,
      pageSize: pag.pageSize,
      totalElements: pag.totalElements,
      totalPages: pag.totalPages,
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
      const pageNum = page;
      const sizeNum = size;

      this.loading = true;
      try {
        const params: any = {
            page: pageNum,
            size: sizeNum,
            sortBy: 'expiryDate',
            direction: 'desc'
        };
        if (!force && this.lastUpdatedMap[pageNum]) {
             params.t = this.lastUpdatedMap[pageNum];
        }

        const data = await api.get<PagedResponse<Audit>>('/registrations', {
          params
        });
        
        this.auditsMap[pageNum] = data.content;
        this.currentPage = data.pageNumber;
        this.pageSize = data.pageSize;
        this.totalElements = data.totalElements;
        this.totalPages = data.totalPages;
        
        this.lastUpdatedMap[pageNum] = data.timestamp;
        
        this.saveToLocalStorage();
      } catch (error: any) {
        if (error.response && error.response.status === 304) {
             this.currentPage = pageNum;
             if (!this.auditsMap[pageNum]) {
                this.auditsMap[pageNum] = [];
             }
             return;
        }
        console.error('Failed to fetch audits', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    saveToLocalStorage() {
      localStorage.setItem('admin_audits_cache', JSON.stringify(this.auditsMap));
      localStorage.setItem('admin_audits_last_updated', JSON.stringify(this.lastUpdatedMap));
      localStorage.setItem('admin_audits_pagination', JSON.stringify(this.pagination));
    },
    clearCache() {
      this.auditsMap = {};
      this.lastUpdatedMap = {};
      this.currentPage = 0;
      this.pageSize = 10;
      this.totalElements = 0;
      this.totalPages = 0;
      localStorage.removeItem('admin_audits_cache');
      localStorage.removeItem('admin_audits_pagination');
      localStorage.removeItem('admin_audits_last_updated');
    }
  }
});