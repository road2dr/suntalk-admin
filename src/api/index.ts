import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

export const authAPI = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),

  snsLogin: (provider: string, sns_id: string) =>
    api.post('/auth/sns-login', { provider, sns_id }),
};

export const usersAPI = {
  getUsers: (params: {
    page?: number;
    page_size?: number;
    name?: string;
    email?: string;
  }) => api.get('/users/', { params }),

  getUser: (id: string) => api.get(`/users/${id}`),

  createUser: (data: any) => api.post('/users/', data),

  updateUser: (id: string, data: any) => api.patch(`/users/${id}`, data),

  updateProfile: (id: string, data: {
    name?: string;
    nickname?: string;
    gender?: string;
    age?: number;
    region_addr?: string;
    thumbnail_url?: string;
    background_image_url?: string;
  }) => api.patch(`/users/${id}/profile`, data),

  toggleBlock: (id: string, isBlocked: boolean) =>
    api.patch(`/users/${id}/block`, null, { params: { is_blocked: isBlocked } }),

  deleteUser: (id: string) => api.delete(`/users/${id}`),
};

export const paymentsAPI = {
  getPayments: (params: {
    page?: number;
    page_size?: number;
    user_id?: string;
    payment_method?: string;
    purpose?: string;
    start_date?: string;
    end_date?: string;
  }) => api.get('/payments/', { params }),

  getPayment: (id: string) => api.get(`/payments/${id}`),

  createPayment: (data: any) => api.post('/payments/', data),

  updatePayment: (id: string, data: any) => api.patch(`/payments/${id}`, data),

  deletePayment: (id: string) => api.delete(`/payments/${id}`),
};

export const sendbirdAPI = {
  getUser: (userId: string) => api.get(`/sendbird/users/${userId}`),

  createUser: (userId: string, nickname: string, profileUrl?: string) =>
    api.post('/sendbird/users', null, { params: { user_id: userId, nickname, profile_url: profileUrl || '' } }),

  deleteUser: (userId: string) => api.delete(`/sendbird/users/${userId}`),

  blockUser: (userId: string, blockedUserId: string) =>
    api.post(`/sendbird/users/${userId}/block`, null, { params: { blocked_user_id: blockedUserId } }),
};