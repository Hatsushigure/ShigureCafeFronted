import { defineStore } from 'pinia';
import api from '../api';
import { useSystemStore } from './system';
import { useToastStore } from './toast';
import i18n from '../locales';
import type { Notice, PaginatedNotices, ReactionCount } from '../types/notice';
import * as noticeCache from '../utils/noticeCache';

const { t } = i18n.global;

export const useNoticeStore = defineStore('notice', {
  state: () => {
    const cachedPages = localStorage.getItem('notice_pages_cache');
    const pagination = localStorage.getItem('notice_pagination');
    const globalLastUpdated = localStorage.getItem('notice_global_last_updated');

    const pag = pagination ? JSON.parse(pagination) : {
      currentPage: 0,
      pageSize: 10,
      totalElements: 0,
      totalPages: 0
    };

    return {
      // Data records: id -> Notice object (Memory cache)
      records: {} as Record<number, Notice>,
      
      // Page mapping: pageNumber -> array of IDs
      pages: (cachedPages ? JSON.parse(cachedPages) : {}) as Record<number, number[]>,
      
      reactions: {} as Record<number, ReactionCount[]>,
      loading: false,
      globalLastUpdated: globalLastUpdated ? parseInt(globalLastUpdated) : 0,
      
      currentPage: pag.currentPage,
      pageSize: pag.pageSize,
      totalElements: pag.totalElements,
      totalPages: pag.totalPages,
      
      fetchPromises: {} as Record<string, Promise<any>>,
      recordsLoaded: false,
    };
  },
  getters: {
    // Get notices for the current page
    currentNotices: (state): Notice[] => {
      const ids = state.pages[state.currentPage] || [];
      return ids.map(id => state.records[id]).filter((n): n is Notice => !!n);
    },
    getNoticeById: (state) => (id: number): Notice | null => {
      return state.records[id] || null;
    },
    getReactions: (state) => (id: number) => {
      return state.reactions[id] || [];
    },
    pagination: (state) => ({
      currentPage: state.currentPage,
      pageSize: state.pageSize,
      totalElements: state.totalElements,
      totalPages: state.totalPages,
    })
  },
  actions: {
    async ensureRecordsLoaded() {
      if (this.recordsLoaded) return;
      
      const cached = await noticeCache.getAllNotices();
      cached.forEach(n => {
        this.records[n.id] = n;
      });
      this.recordsLoaded = true;
    },

    async fetchNotices(page: number = 0, size: number = 10, force: boolean = false) {
      await this.ensureRecordsLoaded();
      const systemStore = useSystemStore();
      const pageNum = page;
      const sizeNum = size;

      // 1. If we have cache, show it immediately (even if expired) for smooth UX
      if (!force && this.pages[pageNum]) {
        this.currentPage = pageNum;

        // 2. If we already know it's expired
        if (this.isCacheExpired()) {
          await this.performFetchNotices(pageNum, sizeNum);
        } else {
          // 3. Background check for updates
          // systemStore.fetchUpdates has a 500ms cache to prevent redundant calls on navigation
          systemStore.fetchUpdates().then(updates => {
            if (updates.noticeLastUpdated > this.globalLastUpdated) {
              this.performFetchNotices(pageNum, sizeNum);
            }
          }).catch(() => { });
        }

        return;
      }

      await this.performFetchNotices(pageNum, sizeNum, force);
    },

    async performFetchNotices(pageNum: number, sizeNum: number, force: boolean = false) {
      const promiseKey = `list-${pageNum}-${sizeNum}`;
      if (this.fetchPromises[promiseKey]) {
        return this.fetchPromises[promiseKey];
      }

      const systemStore = useSystemStore();
      const toastStore = useToastStore();
      this.loading = true;

      const minDelay = 500;

      this.fetchPromises[promiseKey] = (async () => {
        try {
          const url = `/notices?page=${pageNum}&size=${sizeNum}`;
          const [response] = await Promise.all([
            api.get<PaginatedNotices>(url),
            new Promise(resolve => setTimeout(resolve, minDelay))
          ]);

          // Atomic update to avoid UI flicker
          const isGlobalExpired = systemStore.updates.noticeLastUpdated > this.globalLastUpdated;
          const newPages = (force || isGlobalExpired)
            ? {} as Record<number, number[]>
            : { ...this.pages };

          // Update records map and IndexedDB
          response.content.forEach(notice => {
            this.records[notice.id] = notice;
          });
          await noticeCache.saveNotices(response.content);

          // Update page mapping
          newPages[pageNum] = response.content.map(n => n.id);
          this.pages = newPages;
          
          this.totalPages = response.totalPages;
          this.totalElements = response.totalElements;
          this.currentPage = response.pageNumber;
          this.pageSize = response.pageSize;
          this.globalLastUpdated = response.timestamp;

          this.saveToLocalStorage();
        } catch (error: any) {
          toastStore.error(t('notices.messages.fetch-list-failed'), error.message);
        } finally {
          this.loading = false;
          delete this.fetchPromises[promiseKey];
        }
      })();

      return this.fetchPromises[promiseKey];
    },

    async fetchNoticeById(id: number) {
      await this.ensureRecordsLoaded();
      if (this.records[id] && !this.isCacheExpired()) {
        return this.records[id];
      }

      const promiseKey = `detail-${id}`;
      if (this.fetchPromises[promiseKey]) {
        return this.fetchPromises[promiseKey];
      }

      const toastStore = useToastStore();
      this.loading = true;

      this.fetchPromises[promiseKey] = (async () => {
        try {
          const data = await api.get<Notice>(`/notices/${id}`);
          this.records[id] = data;
          await noticeCache.saveNotice(data);
          this.saveToLocalStorage();
          return data;
        } catch (error: any) {
          toastStore.error(t('notices.messages.fetch-detail-failed'), error.message);
          throw error;
        } finally {
          this.loading = false;
          delete this.fetchPromises[promiseKey];
        }
      })();

      return this.fetchPromises[promiseKey];
    },

    async createNotice(noticeData: any) {
      const toastStore = useToastStore();
      try {
        const data = await api.post<Notice>('/notices', noticeData);
        this.records[data.id] = data;
        await noticeCache.saveNotice(data);
        
        // No manual refresh here. The next navigation to the list page
        // will trigger the background refresh logic in fetchNotices.
        
        this.saveToLocalStorage();
        return data;
      } catch (error: any) {
        toastStore.error(t('notices.messages.create-failed'), error.message);
        throw error;
      }
    },

    async updateNotice(id: number, noticeData: any) {
      const toastStore = useToastStore();
      try {
        const data = await api.put<Notice>(`/notices/${id}`, noticeData);
        this.records[id] = data;
        await noticeCache.saveNotice(data);
        
        this.saveToLocalStorage();
        return data;
      } catch (error: any) {
        toastStore.error(t('notices.messages.update-failed'), error.message);
        throw error;
      }
    },

    async deleteNotice(id: number) {
      const toastStore = useToastStore();
      try {
        await api.delete(`/notices/${id}`);
        delete this.records[id];
        delete this.reactions[id];
        await noticeCache.deleteNotice(id);
        
        this.saveToLocalStorage();
        toastStore.success(t('notices.messages.delete-success'));
      } catch (error: any) {
        toastStore.error(t('notices.messages.delete-failed'), error.message);
        throw error;
      }
    },

    async fetchReactions(id: number) {
      try {
        const data = await api.get<ReactionCount[]>(`/notices/${id}/reactions`);
        this.reactions[id] = data;
        return data;
      } catch (error) {
        throw error;
      }
    },

    async fetchReactionsForList(noticeIds: number[]) {
      if (noticeIds.length === 0) return;
      try {
        const data = await api.post<Record<number, ReactionCount[]>>(`/notices/reactions/batch`, noticeIds);
        Object.keys(data).forEach(key => {
          const id = Number(key);
          if (data[id]) {
            this.reactions[id] = data[id];
          }
        });
      } catch (error) {
        // Batch reactions fail silently
      }
    },

    async toggleReaction(noticeId: number, type: string) {
      const toastStore = useToastStore();
      try {
        const data = await api.post<ReactionCount[]>(`/notices/${noticeId}/reactions`, { type });
        this.reactions[noticeId] = data;
        return data;
      } catch (error: any) {
        toastStore.error(t('notices.messages.action-failed'), error.message);
        throw error;
      }
    },

    async sendEmailNotification(subject: string, content: string) {
      const toastStore = useToastStore();
      try {
        await api.post('/notifications/email/all-active', { subject, content });
      } catch (error: any) {
        toastStore.error(t('notices.editor.messages.email-failed'), error.message);
        throw error;
      }
    },

    isCacheExpired() {
      const systemStore = useSystemStore();
      return systemStore.updates.noticeLastUpdated > this.globalLastUpdated;
    },

    saveToLocalStorage() {
      localStorage.setItem('notice_pages_cache', JSON.stringify(this.pages));
      localStorage.setItem('notice_global_last_updated', this.globalLastUpdated.toString());
      localStorage.setItem('notice_pagination', JSON.stringify(this.pagination));
    },

    async clearCache() {
      this.records = {};
      this.pages = {};
      this.globalLastUpdated = 0;
      this.recordsLoaded = false;
      localStorage.removeItem('notice_records_cache');
      localStorage.removeItem('notice_pages_cache');
      localStorage.removeItem('notice_global_last_updated');
      localStorage.removeItem('notice_pagination');
      await noticeCache.clearNotices();
    }
  },
});
