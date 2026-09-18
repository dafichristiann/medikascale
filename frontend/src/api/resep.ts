import { apiClient, USE_MOCK } from './client';
import { MOCK_RESEP_THREAD } from '@/data/mockData';
import type { PesanResep } from '@/types';

let cache: PesanResep[] = JSON.parse(JSON.stringify(MOCK_RESEP_THREAD));

/** GET /resep?kunjungan_id=... — riwayat pesan resep untuk satu kunjungan. */
export async function fetchThreadResep(kunjunganId: number): Promise<PesanResep[]> {
  if (USE_MOCK) return cache.filter((p) => p.kunjungan_id === kunjunganId);
  const { data } = await apiClient.get<PesanResep[]>('/resep', { params: { kunjungan_id: kunjunganId } });
  return data;
}

/** GET /resep — seluruh resep farmasi untuk semua pasien */
export async function fetchAllResep(): Promise<PesanResep[]> {
  if (USE_MOCK) return cache;
  const { data } = await apiClient.get<PesanResep[]>('/resep');
  return data;
}

/** POST /resep — dokter mengirim pesan/resep baru ke apoteker. */
export async function kirimPesanResep(payload: Omit<PesanResep, 'id' | 'waktu'>): Promise<PesanResep> {
  if (USE_MOCK) {
    const item: PesanResep = { ...payload, id: cache.length + 1, waktu: new Date().toISOString() };
    cache.push(item);
    return item;
  }
  const { data } = await apiClient.post<PesanResep>('/resep', payload);
  return data;
}

/** PATCH /resep/:id/status — apoteker memperbarui status penyiapan resep. */
export async function ubahStatusResep(id: number, status: PesanResep['status']): Promise<PesanResep> {
  if (USE_MOCK) {
    const item = cache.find((p) => p.id === id);
    if (!item) throw new Error('Pesan tidak ditemukan');
    item.status = status;
    return item;
  }
  const { data } = await apiClient.patch<PesanResep>(`/resep/${id}/status`, { status });
  return data;
}
