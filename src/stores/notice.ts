import { defineStore } from 'pinia';
import api from '../api';

export interface Notice {
  id: number;
  title: string;
  content: string;
  pinned: boolean;
  authorNickname: string;
  createdAt: string;
  updatedAt: string;
}

export const useNoticeStore = defineStore('notice', {
  state: () => ({
    notices: JSON.parse(localStorage.getItem('cached_notices') || '[]') as Notice[],
    loading: false,
    lastUpdated: localStorage.getItem('notices_last_updated') || null,
  }),
  getters: {
    getNoticeById: (state) => (id: number) => {
      return state.notices.find(n => n.id === id);
    },
    sortedNotices: (state) => {
      return [...state.notices].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }
  },
  actions: {
    async fetchNotices() {
      this.loading = true;
      try {
        const data = await api.get<Notice[]>('/notices');
        this.notices = data;
        this.lastUpdated = new Date().toISOString();
        localStorage.setItem('cached_notices', JSON.stringify(data));
        localStorage.setItem('notices_last_updated', this.lastUpdated);
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
    clearCache() {
      this.notices = [];
      this.lastUpdated = null;
      localStorage.removeItem('cached_notices');
      localStorage.removeItem('notices_last_updated');
    }
  },
});
