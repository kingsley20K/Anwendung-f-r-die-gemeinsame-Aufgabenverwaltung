import { create } from 'zustand';
import type { User } from '../types';
import { tokenStore } from '../api/tokenStore';
import { connectSocket, disconnectSocket } from '../sockets/socket.client';
import * as authApi from '../api/endpoints/auth.api';

interface AuthState {
  user: User | null;
  isBooting: boolean;
  login:    (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout:   () => Promise<void>;
  init:     () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isBooting: true,

  async init() {
    try {
      // Attempt silent refresh using the httpOnly cookie
      const { default: axios } = await import('axios');
      const origin = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
      const { data } = await axios.post<{ accessToken: string }>(
        `${origin}/api/v1/auth/refresh`,
        {},
        { withCredentials: true },
      );
      tokenStore.set(data.accessToken);
      // Fetch the user profile now that we have a valid token
      const user = await authApi.getMe();
      set({ user, isBooting: false });
      connectSocket();
    } catch {
      tokenStore.clear();
      set({ isBooting: false });
    }
  },

  async login(email, password) {
    const data = await authApi.login({ email, password });
    tokenStore.set(data.accessToken);
    set({ user: data.user });
    connectSocket();
  },

  async register(email, password, displayName) {
    const data = await authApi.register({ email, password, displayName });
    tokenStore.set(data.accessToken);
    set({ user: data.user });
    connectSocket();
  },

  async logout() {
    try {
      await authApi.logout();
    } finally {
      tokenStore.clear();
      disconnectSocket();
      set({ user: null });
    }
  },
}));
