import { apiClient, USE_MOCK } from './client';
import { MOCK_KUNJUNGAN } from '@/data/mockData';
import type { Kunjungan, StatusAntrian } from '@/types';

// Salinan in-memory dipakai selama mock, supaya perubahan status/prioritas
// terlihat "tersimpan" di sesi browser tanpa perlu backend.
let cache: Kunjungan[] = JSON.parse(JSON.stringify(MOCK_KUNJUNGAN));

/** GET /antrian?tanggal=YYYY-MM-DD — daftar kunjungan hari ini untuk papan antrian. */
export async function fetchAntrianHariIni(): Promise<Kunjungan[]> {
  if (USE_MOCK) return Promise.resolve(cache);
  const { data } = await apiClient.get<Kunjungan[]>('/antrian', {
    params: { tanggal: new Date().toISOString().slice(0, 10) },
  });
  return data;
}

/** PATCH /antrian/:id/status — memindahkan kunjungan ke status berikutnya. */
export async function ubahStatusAntrian(kunjunganId: number, statusBaru: StatusAntrian): Promise<Kunjungan> {
  if (USE_MOCK) {
    const item = cache.find((k) => k.id === kunjunganId);
    if (!item) throw new Error('Kunjungan tidak ditemukan');
    item.status_antrian = statusBaru;
    item.updated_at = new Date().toISOString();
    return item;
  }
  const { data } = await apiClient.patch<Kunjungan>(`/antrian/${kunjunganId}/status`, { status: statusBaru });
  return data;
}

/** PATCH /antrian/:id/prioritas — menandai kunjungan sebagai prioritas (nomor tetap, urutan dilayani maju). */
export async function prioritaskanAntrian(kunjunganId: number): Promise<Kunjungan> {
  if (USE_MOCK) {
    const item = cache.find((k) => k.id === kunjunganId);
    if (!item) throw new Error('Kunjungan tidak ditemukan');
    item.prioritas = true;
    return item;
  }
  const { data } = await apiClient.patch<Kunjungan>(`/antrian/${kunjunganId}/prioritas`, { prioritas: true });
  return data;
}

/** Urutan tampil per kolom kanban: prioritas dulu, lalu yang lebih dulu terdaftar. */
export function urutkanAntrian(items: Kunjungan[]): Kunjungan[] {
  return [...items].sort((a, b) => {
    if (a.prioritas !== b.prioritas) return a.prioritas ? -1 : 1;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });
}

export const URUTAN_STATUS: StatusAntrian[] = ['putih', 'hijau', 'kuning', 'merah'];
