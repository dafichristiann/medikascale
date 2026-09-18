import { apiClient, USE_MOCK } from './client';
import { MOCK_ARSIP, MOCK_TRACKING } from '@/data/mockData';
import type { ArsipLokasi, ArsipTrackingStep } from '@/types';

/** GET /arsip/cari?q=... — cari lokasi rak berkas fisik berdasarkan nama/No.RM. */
export async function cariArsip(query: string): Promise<ArsipLokasi[]> {
  if (USE_MOCK) {
    const q = query.trim().toLowerCase();
    if (!q) return MOCK_ARSIP;
    return MOCK_ARSIP.filter(
      (a) => a.nama_pasien.toLowerCase().includes(q) || a.no_rm.toLowerCase().includes(q),
    );
  }
  const { data } = await apiClient.get<ArsipLokasi[]>('/arsip/cari', { params: { q: query } });
  return data;
}

/** GET /arsip/:pasienId/tracking — status pelacakan pengiriman dokumen antar lantai. */
export async function fetchTrackingDokumen(_pasienId: number): Promise<ArsipTrackingStep[]> {
  if (USE_MOCK) return MOCK_TRACKING;
  const { data } = await apiClient.get<ArsipTrackingStep[]>(`/arsip/${_pasienId}/tracking`);
  return data;
}

/** POST /arsip/:pasienId/minta-pengiriman — memicu permintaan pengiriman dokumen antar lantai. */
export async function mintaPengirimanDokumen(pasienId: number, tujuanLantai: string): Promise<void> {
  if (USE_MOCK) return;
  await apiClient.post(`/arsip/${pasienId}/minta-pengiriman`, { tujuan_lantai: tujuanLantai });
}
