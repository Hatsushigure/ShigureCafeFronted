import { defineStore } from 'pinia';
import api from '../api';
import { useSystemStore } from './system';
import { useToastStore } from './toast';
import i18n from '../locales';

const { t } = i18n.global;

export interface ReactionCount {
  type: string;
  count: number;
  reacted: boolean;
}

export interface Notice {
  id: number;
  title: string;
  content: string;
  pinned: boolean;
  authorNickname: string;
  createdAt: number;
  updatedAt: number;
}

export interface PaginatedNotices {
  content: Notice[];
  totalPages: number;
  totalElements: number;
  pageSize: number;
  pageNumber: number;
  timestamp: number;
}

export const useNoticeStore = defineStore('notice', {
  state: () => {
    const cached = localStorage.getItem('cached_notices');
    const pagination = localStorage.getItem('notices_pagination');
    const globalLastUpdated = localStorage.getItem('notices_global_last_updated');

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

    return {
      notices: parsePotentialMap(cached) as Record<number, Notice[]>,
      reactions: {} as Record<number, ReactionCount[]>,
      loading: false,
      globalLastUpdated: globalLastUpdated ? parseInt(globalLastUpdated) : 0,
      totalPages: pagination ? JSON.parse(pagination).totalPages as number : 0,
      totalElements: pagination ? JSON.parse(pagination).totalElements as number : 0,
      currentPage: pagination ? JSON.parse(pagination).currentPage as number : 0,
      pageSize: pagination ? JSON.parse(pagination).pageSize as number : 10,
      fetchCount: 0,
      fetchPromises: {} as Record<string, Promise<void>>,
    };
  },
  getters: {
    currentNotices: (state) => {
      return state.notices[state.currentPage] || [];
    },
    getNoticeById: (state) => (id: number) => {
      for (const page in state.notices) {
        const pageNotices = state.notices[page];
        if (Array.isArray(pageNotices)) {
          const notice = pageNotices.find((n: Notice) => n.id === id);
          if (notice) return notice;
        }
      }
      return null;
    },
    getReactions: (state) => (id: number) => {
      return state.reactions[id] || [];
    }
  },
  actions: {
    async fetchNotices(page: number = 0, size: number = 10, force: boolean = false) {
      const systemStore = useSystemStore();
      const pageNum = page;
      const sizeNum = size;

      // 1. If we have cache and it's not a forced refresh, switch immediately
      if (!force && this.notices[pageNum]) {
        this.currentPage = pageNum;

        // Background check for updates - Fire and forget
        systemStore.fetchUpdates().then(updates => {
          if (updates.noticeLastUpdated > this.globalLastUpdated) {
            this.performFetchNotices(pageNum, sizeNum);
          }
        }).catch(() => { });

        return;
      }

      await this.performFetchNotices(pageNum, sizeNum, force);
    },
    async performFetchNotices(pageNum: number, sizeNum: number, force: boolean = false) {
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
          const url = `/notices?page=${pageNum}&size=${sizeNum}`;
          const [response] = await Promise.all([
            api.get<PaginatedNotices>(url),
            new Promise(resolve => setTimeout(resolve, minDelay))
          ]);

          if (force || systemStore.updates.noticeLastUpdated > this.globalLastUpdated) {
            this.notices = {};
          }

          this.notices[pageNum] = response.content;
          this.totalPages = response.totalPages;
          this.totalElements = response.totalElements;
          this.currentPage = response.pageNumber;
          this.pageSize = response.pageSize;
          this.globalLastUpdated = response.timestamp;
          this.fetchCount++;

          this.saveToLocalStorage();
        } catch (error: any) {
          toastStore.error(t('notices.messages.fetch-list-failed'), error.message);
        } finally {
          this.loading = false;
          delete this.fetchPromises[cacheKey];
        }
      })();

      return this.fetchPromises[cacheKey];
    },
    async fetchNoticeById(id: number) {
      const toastStore = useToastStore();
      try {
        const data = await api.get<Notice>(`/notices/${id}`);
        this.updateNoticeInCache(data);
        return data;
      } catch (error: any) {
        toastStore.error(t('notices.messages.fetch-detail-failed'), error.message);
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
    async deleteNotice(id: number) {
      const { t } = i18n.global;
      const toastStore = useToastStore();
      try {
        await api.delete(`/notices/${id}`);
        // Remove from cache
        Object.keys(this.notices).forEach(page => {
          const pageNum = Number(page);
          if (this.notices[pageNum]) {
            this.notices[pageNum] = this.notices[pageNum].filter(n => n.id !== id);
          }
        });
        delete this.reactions[id];
        this.saveToLocalStorage();
        toastStore.success(t('notices.messages.delete-success'));
      } catch (error: any) {
        toastStore.error(t('notices.messages.delete-failed'), error.message);
        throw error;
      }
    },
    updateNoticeInCache(updatedNotice: Notice) {
      let found = false;
      const pages = Object.keys(this.notices);
      for (const page of pages) {
        const pageNum = Number(page);
        const pageNotices = this.notices[pageNum];
        if (Array.isArray(pageNotices)) {
          const index = pageNotices.findIndex((n: Notice) => n.id === updatedNotice.id);
          if (index !== -1) {
            pageNotices[index] = updatedNotice;
            found = true;
          }
        }
      }
      if (found) {
        this.saveToLocalStorage();
      }
    },
    saveToLocalStorage() {
      localStorage.setItem('cached_notices', JSON.stringify(this.notices));
      localStorage.setItem('notices_global_last_updated', this.globalLastUpdated.toString());
      localStorage.setItem('notices_pagination', JSON.stringify({
        totalPages: this.totalPages,
        totalElements: this.totalElements,
        currentPage: this.currentPage,
        pageSize: this.pageSize
      }));
    },
    clearCache() {
      this.notices = {};
      this.globalLastUpdated = 0;
      localStorage.removeItem('cached_notices');
      localStorage.removeItem('notices_global_last_updated');
      localStorage.removeItem('notices_pagination');
    }
  },
});