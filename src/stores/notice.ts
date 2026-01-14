import { defineStore } from 'pinia';
import api from '../api';

export interface ReactionCount {
  emoji: string;
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
    const lastUpdated = localStorage.getItem('notices_last_updated');

    // Helper to handle legacy Map-to-Array serialization
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
      reactions: {} as Record<number, ReactionCount[]>, // Cache reactions in memory (not persisted for now)
      loading: false,
      lastUpdatedMap: parsePotentialMap(lastUpdated) as Record<number, number>,
      totalPages: pagination ? JSON.parse(pagination).totalPages as number : 0,
      totalElements: pagination ? JSON.parse(pagination).totalElements as number : 0,
      currentPage: pagination ? JSON.parse(pagination).currentPage as number : 0,
      pageSize: pagination ? JSON.parse(pagination).pageSize as number : 10,
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
      const pageNum = page;
      const sizeNum = size;

      this.loading = true;
      try {
        let url = `/notices?page=${pageNum}&size=${sizeNum}`;
        // If we have a timestamp for this page and not forcing, send it
        if (!force && this.lastUpdatedMap[pageNum]) {
          url += `&t=${this.lastUpdatedMap[pageNum]}`;
        }

        const response = await api.get<PaginatedNotices>(url);
        
        // Update state
        this.notices[pageNum] = response.content;
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
        this.currentPage = response.pageNumber;
        this.pageSize = response.pageSize;

        // Use the server-provided timestamp for this page
        this.lastUpdatedMap[pageNum] = response.timestamp;

        this.saveToLocalStorage();
      } catch (error: any) {
        // Handle 304 Not Modified
        if (error.response && error.response.status === 304) {
          this.currentPage = pageNum;
          // Ensure notices[pageNum] exists even if 304 (it should if it was cached)
          if (!this.notices[pageNum]) {
            this.notices[pageNum] = [];
          }
          return;
        }

        console.error('Failed to fetch notices', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async fetchNoticeById(id: number) {
      try {
        const data = await api.get<Notice>(`/notices/${id}`);
        // Optionally update the cached notice if it exists in any page
        this.updateNoticeInCache(data);
        return data;
      } catch (error) {
        console.error(`Failed to fetch notice ${id}`, error);
        throw error;
      }
    },
    async fetchReactions(id: number) {
        try {
            const data = await api.get<ReactionCount[]>(`/notices/${id}/reactions`);
            this.reactions[id] = data;
            return data;
        } catch (error) {
            console.error(`Failed to fetch reactions for notice ${id}`, error);
            throw error;
        }
    },
    async fetchReactionsForList(noticeIds: number[]) {
        if (noticeIds.length === 0) return;
        try {
            const data = await api.post<Record<number, ReactionCount[]>>(`/notices/reactions/batch`, noticeIds);
            // Merge into state
            Object.keys(data).forEach(key => {
                const id = Number(key);
                if (data[id]) {
                    this.reactions[id] = data[id];
                }
            });
        } catch (error) {
            console.error('Failed to batch fetch reactions', error);
        }
    },
    async toggleReaction(noticeId: number, emoji: string) {
      try {
        const data = await api.post<ReactionCount[]>(`/notices/${noticeId}/reactions`, { emoji });
        this.reactions[noticeId] = data;
        return data;
      } catch (error) {
        console.error(`Failed to toggle reaction on notice ${noticeId}`, error);
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
      localStorage.setItem('notices_last_updated', JSON.stringify(this.lastUpdatedMap));
      localStorage.setItem('notices_pagination', JSON.stringify({
        totalPages: this.totalPages,
        totalElements: this.totalElements,
        currentPage: this.currentPage,
        pageSize: this.pageSize
      }));
    },
    clearCache() {
      this.notices = {};
      this.lastUpdatedMap = {};
      localStorage.removeItem('cached_notices');
      localStorage.removeItem('notices_last_updated');
      localStorage.removeItem('notices_pagination');
    }
  },
});