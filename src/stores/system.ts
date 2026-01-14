import { defineStore } from 'pinia';
import api from '../api';

export interface SystemUpdates {
  noticeLastUpdated: number;
  userLastUpdated: number;
  auditLastUpdated: number;
}

export const useSystemStore = defineStore('system', {
  state: () => ({
    updates: {
      noticeLastUpdated: 0,
      userLastUpdated: 0,
      auditLastUpdated: 0,
    } as SystemUpdates,
    loading: false,
    lastFetched: 0,
    fetchPromise: null as Promise<SystemUpdates> | null,
  }),
  actions: {
    async fetchUpdates() {
      if (this.fetchPromise) {
        return this.fetchPromise;
      }

      if (Date.now() - this.lastFetched < 1000) {
        return this.updates;
      }
      
      this.loading = true;
      this.fetchPromise = api.get<SystemUpdates>('/system/updates').then(data => {
        this.updates = data;
        this.lastFetched = Date.now();
        this.fetchPromise = null;
        return data;
      }).catch(error => {
        this.fetchPromise = null;
        throw error;
      }).finally(() => {
        this.loading = false;
      });

      return this.fetchPromise;
    }
  }
});