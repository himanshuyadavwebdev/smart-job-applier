import { create } from 'zustand';
import { authApi } from '../api/authApi.js';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isHydrating: true,

  login: (userData, token) => {
    localStorage.setItem('sja_token', token);
    localStorage.setItem('sja_user', JSON.stringify(userData));
    set({ user: userData, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('sja_token');
    localStorage.removeItem('sja_user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  setUser: (user) => {
    localStorage.setItem('sja_user', JSON.stringify(user));
    set({ user });
  },

  hydrate: async () => {
    const token = localStorage.getItem('sja_token');
    if (!token) {
      set({ isHydrating: false });
      return;
    }
    try {
      const res = await authApi.getMe();
      const { user } = res.data.data;
      set({ user, token, isAuthenticated: true, isHydrating: false });
    } catch {
      localStorage.removeItem('sja_token');
      localStorage.removeItem('sja_user');
      set({ user: null, token: null, isAuthenticated: false, isHydrating: false });
    }
  },
}));
