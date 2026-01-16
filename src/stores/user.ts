import { defineStore } from 'pinia';
import api from '../api';

export interface UserProfile {
  username: string;
  nickname: string;
  email: string;
  avatarUrl?: string;
  minecraftUsername?: string;
}

export const useUserStore = defineStore('user', {
  state: () => {
    const cached = localStorage.getItem('user_profiles_cache');
    return {
      profiles: (cached ? JSON.parse(cached) : {}) as Record<string, UserProfile>,
      fetchPromises: {} as Record<string, Promise<UserProfile>>,
    };
  },
  actions: {
    async fetchProfile(username: string): Promise<UserProfile> {
      if (this.profiles[username]) {
        return this.profiles[username];
      }

      if (this.fetchPromises[username]) {
        return this.fetchPromises[username];
      }

      this.fetchPromises[username] = (async () => {
        try {
          const data = await api.get<UserProfile>(`/users/${username}/public`);
          this.profiles[username] = data;
          this.saveToLocalStorage();
          return data;
        } catch (error) {
          console.error(`Failed to fetch profile for ${username}:`, error);
          throw error;
        } finally {
          delete this.fetchPromises[username];
        }
      })();

      return this.fetchPromises[username];
    },
    saveToLocalStorage() {
      localStorage.setItem('user_profiles_cache', JSON.stringify(this.profiles));
    },
    clearCache() {
      this.profiles = {};
      localStorage.removeItem('user_profiles_cache');
    }
  }
});
