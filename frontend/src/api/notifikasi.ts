import { apiClient, USE_MOCK } from './client';
import type { NotifikasiItem } from '@/types';

export interface NotifikasiResponse {
  data: NotifikasiItem[];
  unread_count: number;
}

export async function fetchNotifikasi(): Promise<NotifikasiResponse> {
  if (USE_MOCK) {
    return {
      data: [
        {
          id: 1,
          judul: 'Resep Siap Diambil',
          pesan: 'Resep pasien Siti Aminah sudah disiapkan oleh Apotek',
          tipe: 'resep',
          dibaca: false,
          created_at: new Date().toISOString(),
        },
      ],
      unread_count: 1,
    };
  }

  const { data } = await apiClient.get<NotifikasiResponse>('/notifikasi');
  return data;
}

export async function markNotifikasiRead(id: number): Promise<any> {
  if (USE_MOCK) return { success: true };
  const { data } = await apiClient.patch(`/notifikasi/${id}/baca`);
  return data;
}

export async function markAllNotifikasiRead(): Promise<any> {
  if (USE_MOCK) return { success: true };
  const { data } = await apiClient.patch('/notifikasi/baca-semua');
  return data;
}
