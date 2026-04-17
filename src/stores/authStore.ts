import { create } from 'zustand';
import { authAPI } from '../api';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const storedToken = localStorage.getItem('access_token');

export const useAuthStore = create<AuthState>((set) => ({
  token: storedToken,
  isAuthenticated: !!storedToken,
  loading: false,

  login: async (username: string, password: string) => {
    set({ loading: true });
    try {
      const response = await authAPI.login(username, password);
      const token = response.data.access_token;
      localStorage.setItem('access_token', token);
      set({ token, isAuthenticated: true, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    set({ token: null, isAuthenticated: false });
  },
}));