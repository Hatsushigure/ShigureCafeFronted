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
  reactions: ReactionCount[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedNotices {
  content: Notice[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export const useNoticeStore = defineStore('notice', {
  state: () => ({
    notices: [] as Notice[],
    loading: false,
    lastUpdated: localStorage.getItem('notices_last_updated') || null,
    totalPages: 0,
    totalElements: 0,
    currentPage: 0,
    pageSize: 10,
  }),
  getters: {
    getNoticeById: (state) => (id: number) => {
      return state.notices.find(n => n.id === id);
    },
    sortedNotices: (state) => {
      // The backend already sorts by pinned and createdAt, but we keep this for safety
      return [...state.notices].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }
  },
  actions: {
    async fetchNotices(page: any = 0, size: any = 10) {
      const pageNum = typeof page === 'number' ? page : 0;
      const sizeNum = typeof size === 'number' ? size : 10;
      this.loading = true;
      try {
        const response = await api.get<PaginatedNotices>(`/notices?page=${pageNum}&size=${sizeNum}&t=${Date.now()}`);
        this.notices = response.content;
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
        this.currentPage = response.number;
        this.pageSize = response.size;
        
        this.lastUpdated = new Date().toISOString();
        // We only cache the first page for the landing page preview if needed
        if (page === 0) {
          localStorage.setItem('cached_notices', JSON.stringify(response.content));
          localStorage.setItem('notices_last_updated', this.lastUpdated);
        }
      } catch (error) {
        console.error('Failed to fetch notices', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async fetchNoticeById(id: number) {
      try {
        const data = await api.get<Notice>(`/notices/${id}`);
        // Update the notice in the list if it exists
        const index = this.notices.findIndex(n => n.id === id);
        if (index !== -1) {
          this.notices[index] = data;
          localStorage.setItem('cached_notices', JSON.stringify(this.notices));
        }
        return data;
      } catch (error) {
        console.error(`Failed to fetch notice ${id}`, error);
        throw error;
      }
    },
    async toggleReaction(noticeId: number, emoji: string) {
      try {
        const data = await api.post<Notice>(`/notices/${noticeId}/reactions`, { emoji });
        const index = this.notices.findIndex(n => n.id === noticeId);
        if (index !== -1) {
          this.notices[index] = data;
          if (this.currentPage === 0) {
            localStorage.setItem('cached_notices', JSON.stringify(this.notices));
          }
        }
        return data;
      } catch (error) {
        console.error(`Failed to toggle reaction on notice ${noticeId}`, error);
        throw error;
      }
    },
    clearCache() {
      this.notices = [];
      this.lastUpdated = null;
      localStorage.removeItem('cached_notices');
      localStorage.removeItem('notices_last_updated');
    }
  },
});
