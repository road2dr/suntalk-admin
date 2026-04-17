import { create } from 'zustand';
import { authAPI } from '../api';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  isAuthenticated: false,

  login: async (username: string, password: string) => {
    const response = await authAPI.login(username, password);
    const token = response.data.access_token;
    localStorage.setItem('access_token', token);
    set({ token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('access_token');
    set({ token: null, isAuthenticated: false });
  },

  hydrate: () => {
    const token = localStorage.getItem('access_token');
    set({ token, isAuthenticated: !!token });
  },
}));