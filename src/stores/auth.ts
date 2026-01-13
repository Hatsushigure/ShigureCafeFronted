import { defineStore } from 'pinia';
import api from '../api';
import { jwtDecode } from 'jwt-decode';

interface User {
  username: string;
  nickname: string;
  email: string;
  role: string;
  status: string;
  twoFactorEnabled: boolean;
  email2faEnabled: boolean;
  totpEnabled: boolean;
  minecraftUuid: string;
  minecraftUsername: string;
}

interface JwtPayload {
  sub: string;
  exp: number;
  iat: number;
}

interface LoginResponse {
  token: string | null;
  twoFactorRequired: boolean;
  hasTotp: boolean;
  hasEmail2fa: boolean;
  email: string | null;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: null as User | null,
    twoFactorRequired: false,
    hasTotp: false,
    hasEmail2fa: false,
    twoFactorEmail: null as string | null,
    pendingUsername: null as string | null,
    fetchUserPromise: null as Promise<void> | null,
  }),
  actions: {
    async login(credentials: any) {
      const response = await api.post<LoginResponse>('/auth/token', credentials);
      if (response.twoFactorRequired) {
        this.twoFactorRequired = true;
        this.hasTotp = response.hasTotp;
        this.hasEmail2fa = response.hasEmail2fa;
        this.twoFactorEmail = response.email;
        this.pendingUsername = credentials.username;
        return { twoFactorRequired: true };
      }
      this.token = response.token;
      if (this.token) {
        localStorage.setItem('token', this.token);
        await this.fetchCurrentUser();
      }
      return { twoFactorRequired: false };
    },
    async verify2FA(code: string) {
      if (!this.pendingUsername) return;
      const response = await api.post<LoginResponse>('/auth/2fa/verify', {
        username: this.pendingUsername,
        code: code,
      });
      this.token = response.token;
      if (this.token) {
        localStorage.setItem('token', this.token);
        this.twoFactorRequired = false;
        this.hasTotp = false;
        this.hasEmail2fa = false;
        this.twoFactorEmail = null;
        this.pendingUsername = null;
        await this.fetchCurrentUser();
      }
    },
    async toggleTwoFactor(enabled: boolean, code?: string) {
      if (!this.user) return;
      await api.put(`/users/${this.user.username}/2fa`, { enabled, code });
      if (this.user) {
        this.user.email2faEnabled = enabled;
      }
    },
    async send2FACode() {
      if (!this.twoFactorEmail) return;
      await api.post('/auth/verification-codes', {
        email: this.twoFactorEmail,
        type: '2FA',
      });
    },
    async fetchCurrentUser() {
      if (!this.token) return;
      if (this.user) return;
      if (this.fetchUserPromise) return this.fetchUserPromise;

      this.fetchUserPromise = (async () => {
        try {
          const decoded = jwtDecode<JwtPayload>(this.token!);
          const username = decoded.sub;
          const data = await api.get<User[]>(`/users?username=${username}`);
          if (data && data.length > 0) {
            this.user = data[0] ?? null;
          }
        } catch (error) {
          console.error('Failed to fetch user', error);
        } finally {
          this.fetchUserPromise = null;
        }
      })();

      return this.fetchUserPromise;
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
