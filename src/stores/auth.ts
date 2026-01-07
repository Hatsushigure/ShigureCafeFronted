import { defineStore } from 'pinia';
import api from '../api';
import { jwtDecode } from 'jwt-decode';

interface User {
  username: string;
  email: string;
  role: string;
}

interface JwtPayload {
  sub: string;
  exp: number;
  iat: number;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: null as User | null,
  }),
  actions: {
    async login(credentials: any) {
      const { data } = await api.post('/auth/token', credentials);
      this.token = data.token;
      localStorage.setItem('token', data.token);
      await this.fetchCurrentUser();
    },
    async fetchCurrentUser() {
      if (!this.token) return;
      try {
        const decoded = jwtDecode<JwtPayload>(this.token);
        const username = decoded.sub;
        const { data } = await api.get<User[]>(`/users?username=${username}`);
        if (data && data.length > 0) {
          this.user = data[0] ?? null;
        }
      } catch (error) {
        console.error('Failed to fetch user', error);
      }
    },
    async logout() {
      try {
        await api.delete('/auth/token');
      } finally {
        this.token = null;
        this.user = null;
        localStorage.removeItem('token');
        // Optional: redirect to login handled in component or router
      }
    },
  },
});
