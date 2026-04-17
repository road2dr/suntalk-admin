import { create } from 'zustand';
import { usersAPI } from '../api';

export interface User {
  id: string;
  name: string;
  nickname: string | null;
  email: string | null;
  gender: string | null;
  age: number | null;
  region_addr: string | null;
  kakao_id: string | null;
  naver_id: string | null;
  google_id: string | null;
  apple_id: string | null;
  thumbnail_url: string | null;
  background_image_url: string | null;
  points: number;
  is_blocked: boolean;
  login_completed: boolean;
  created_at: string;
  updated_at: string;
}

interface UsersState {
  users: User[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  searchName: string;
  searchEmail: string;
  detailUser: User | null;
  detailModalOpen: boolean;
  blockLoading: string | null;

  setSearchName: (name: string) => void;
  setSearchEmail: (email: string) => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setDetailModalOpen: (open: boolean) => void;
  fetchUsers: () => Promise<void>;
  fetchUser: (id: string) => Promise<void>;
  toggleBlock: (userId: string, isBlocked: boolean) => Promise<void>;
}

export const useUsersStore = create<UsersState>((set, get) => ({
  users: [],
  total: 0,
  page: 1,
  pageSize: 20,
  loading: false,
  searchName: '',
  searchEmail: '',
  detailUser: null,
  detailModalOpen: false,
  blockLoading: null,

  setSearchName: (name) => set({ searchName: name }),
  setSearchEmail: (email) => set({ searchEmail: email }),
  setPage: (page) => set({ page }),
  setPageSize: (pageSize) => set({ pageSize }),
  setDetailModalOpen: (open) => set({ detailModalOpen: open }),

  fetchUsers: async () => {
    set({ loading: true });
    try {
      const { page, pageSize, searchName, searchEmail } = get();
      const params: any = { page, page_size: pageSize };
      if (searchName) params.name = searchName;
      if (searchEmail) params.email = searchEmail;
      const response = await usersAPI.getUsers(params);
      set({
        users: response.data.users,
        total: response.data.total,
        loading: false,
      });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  fetchUser: async (id: string) => {
    try {
      const response = await usersAPI.getUser(id);
      set({ detailUser: response.data, detailModalOpen: true });
    } catch (error) {
      throw error;
    }
  },

  toggleBlock: async (userId: string, isBlocked: boolean) => {
    set({ blockLoading: userId });
    try {
      await usersAPI.toggleBlock(userId, !isBlocked);
      const { detailUser } = get();
      if (detailUser?.id === userId) {
        set({ detailUser: { ...detailUser, is_blocked: !isBlocked } });
      }
      await get().fetchUsers();
    } finally {
      set({ blockLoading: null });
    }
  },
}));