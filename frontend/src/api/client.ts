import axios from 'axios';

// Mock hanya boleh aktif jika diminta secara eksplisit. Ini mencegah build
// production diam-diam memakai akun/data lokal ketika env belum tersedia.
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  withCredentials: true,
});

// Sisipkan token JWT (kalau ada) ke setiap request. Backend NestJS
// direkomendasikan mengembalikan token ini dari endpoint /auth/login.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('medikascale_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Kalau backend mengembalikan 401, paksa logout & kembali ke halaman login.
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem('medikascale_token');
      localStorage.removeItem('medikascale_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);
