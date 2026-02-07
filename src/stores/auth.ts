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
  avatarUrl?: string;
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
  state: () => {
    const cachedUser = localStorage.getItem('auth_user_cache');
    return {
      token: localStorage.getItem('token'),
      user: (cachedUser ? JSON.parse(cachedUser) : null) as User | null,
      lastUpdated: localStorage.getItem('auth_user_last_updated') as number | null,
      twoFactorRequired: false,
      hasTotp: false,
      hasEmail2fa: false,
      twoFactorEmail: null as string | null,
      pendingUsername: null as string | null,
      fetchUserPromise: null as Promise<void> | null,
    };
  },
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
        await this.fetchCurrentUser(true);
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
        await this.fetchCurrentUser(true);
      }
    },
    async validateToken() {
      if (!this.token) return false;
      try {
        await api.get('/auth/validate');
        return true;
      } catch (error) {
        return false;
      }
    },
    async performSessionCheck() {
      if (!this.token) {
        await this.logout({ skipApi: true });
        return false;
      }
      const isValid = await this.validateToken();
      if (!isValid) {
        await this.logout({ skipApi: true });
        return false;
      }
      return true;
    },
    async toggleTwoFactor(enabled: boolean, code?: string) {
      if (!this.user) return;
      await api.put(`/users/${this.user.username}/2fa`, { enabled, code });
      if (this.user) {
        this.user.email2faEnabled = enabled;
        localStorage.setItem('auth_user_cache', JSON.stringify(this.user));
      }
    },
    async fetchCurrentUser(force: boolean = false) {
      if (!this.token) return;

      if (!force && this.user) return;

      if (this.fetchUserPromise) return this.fetchUserPromise;

      this.fetchUserPromise = (async () => {
        try {
          const decoded = jwtDecode<JwtPayload>(this.token!);
          const username = decoded.sub;
          const data = await api.get<User>(`/users/${username}`);
          if (data) {
            this.user = data;
            this.lastUpdated = Date.now();
            localStorage.setItem('auth_user_cache', JSON.stringify(this.user));
            localStorage.setItem('auth_user_last_updated', this.lastUpdated.toString());
          }
        } catch (error) {
          // Silent fail, handled by lack of user in state
        } finally {
          this.fetchUserPromise = null;
        }
      })();

      return this.fetchUserPromise;
    },
    async logout(options: { skipApi?: boolean } = {}) {
      try {
        if (!options.skipApi && this.token) {
          await api.delete('/auth/token');
        }
      } catch (error) {
        // Ignore error as we are logging out anyway
      } finally {
        this.token = null;
        this.user = null;
        this.lastUpdated = null;
        localStorage.removeItem('token');
        localStorage.removeItem('auth_user_cache');
        localStorage.removeItem('auth_user_last_updated');
        
        const { useChatStore } = await import('./chat');
        const chatStore = useChatStore();
        await chatStore.clearHistory();

        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    },
  },
});
