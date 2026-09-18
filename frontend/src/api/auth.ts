import { apiClient, USE_MOCK } from './client';
import { MOCK_USERS } from '@/data/mockData';
import type { AuthenticatedUser } from '@/types';

export interface LoginResponse {
  token: string;
  user: AuthenticatedUser;
}

/**
 * Memanggil POST /auth/login di backend NestJS.
 * Kontrak yang diharapkan dari backend:
 *   Request  : { username: string, password: string }
 *   Response : { token: string, user: AuthenticatedUser }
 * `user.permissions` WAJIB berisi daftar permission.kode hasil JOIN
 * role_permissions + permissions milik role user tersebut (lihat skema RBAC).
 *
 * Selama VITE_USE_MOCK=true (default, karena backend belum ada),
 * fungsi ini memakai data akun demo di src/data/mockData.ts.
 */
export async function loginRequest(username: string, password: string): Promise<LoginResponse> {
  if (USE_MOCK) {
    await delay(400); // simulasi latensi jaringan
    const found = MOCK_USERS.find((u) => u.username === username && u.password === password);
    if (!found) {
      throw new Error('Username atau password salah.');
    }
    const { password: _pw, ...user } = found;
    return { token: `mock-token-${user.id}`, user };
  }

  const { data } = await apiClient.post<LoginResponse>('/auth/login', { username, password });
  return data;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
