import axios from 'axios';
import type { AxiosInstance } from 'axios';
import type { AuthResponse } from '../types/index';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (username: string, password: string): Promise<AuthResponse> => {
    const res = await api.post('/auth/login', { username, password });
    return res.data;
  },

  refresh: async (token: string): Promise<AuthResponse> => {
    const res = await api.post('/auth/refresh', { token });
    return res.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export const antrianService = {
  list: async (filters: Record<string, any> = {}) => {
    const res = await api.get('/antrian', { params: filters });
    return res.data;
  },

  detail: async (id: string) => {
    const res = await api.get(`/antrian/${id}`);
    return res.data;
  },

  updateStatus: async (id: string, status: string, prioritas?: boolean) => {
    const res = await api.put(`/antrian/${id}/status`, { status, prioritas });
    return res.data;
  },

  log: async (kunjungan_id: string) => {
    const res = await api.get(`/antrian/log/${kunjungan_id}`);
    return res.data;
  },
};

export const antropometriService = {
  create: async (data: any) => {
    const res = await api.post('/antropometri', data);
    return res.data;
  },

  history: async (pasien_id: string) => {
    const res = await api.get(`/antropometri/pasien/${pasien_id}`);
    return res.data;
  },

  report: async (filters: Record<string, any> = {}) => {
    const res = await api.get('/antropometri/report', { params: filters });
    return res.data;
  },
};

export const pasienService = {
  detail: async (id: string) => {
    const res = await api.get(`/pasien/${id}`);
    return res.data;
  },

  kunjungan: async (filters: Record<string, any> = {}) => {
    const res = await api.get('/kunjungan', { params: filters });
    return res.data;
  },
};

export default api;
