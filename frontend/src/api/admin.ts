import { apiClient, USE_MOCK } from './client';
import type { AdminUser, AdminRole, Permission } from '@/types';

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  if (USE_MOCK) return [];
  const { data } = await apiClient.get<AdminUser[]>('/admin/users');
  return data;
}

export async function createAdminUser(payload: {
  nama: string;
  username: string;
  password: string;
  role_id: number;
  email?: string;
  no_telepon?: string;
}): Promise<AdminUser> {
  const { data } = await apiClient.post<AdminUser>('/admin/users', payload);
  return data;
}

export async function updateAdminUserStatus(id: number, aktif: boolean): Promise<AdminUser> {
  const { data } = await apiClient.patch<AdminUser>(`/admin/users/${id}/status`, { aktif });
  return data;
}

export async function updateAdminUserRole(id: number, role_id: number): Promise<AdminUser> {
  const { data } = await apiClient.patch<AdminUser>(`/admin/users/${id}/role`, { role_id });
  return data;
}

export async function fetchAdminRoles(): Promise<AdminRole[]> {
  if (USE_MOCK) return [];
  const { data } = await apiClient.get<AdminRole[]>('/admin/roles');
  return data;
}

export async function fetchAdminPermissions(): Promise<Permission[]> {
  if (USE_MOCK) return [];
  const { data } = await apiClient.get<Permission[]>('/admin/permissions');
  return data;
}

export async function updateRolePermissions(roleId: number, permissionIds: number[]): Promise<AdminRole> {
  const { data } = await apiClient.patch<AdminRole>(`/admin/roles/${roleId}/permissions`, {
    permission_ids: permissionIds,
  });
  return data;
}
