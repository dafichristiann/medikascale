import { apiClient, USE_MOCK } from './client';
import { MOCK_LAYANAN, MOCK_LAB } from '@/data/mockData';
import type { AntropometriPengukuran, Layanan, PermintaanLab } from '@/types';

/** GET /layanan — katalog layanan aktif (dipakai form registrasi & katalog). */
export async function fetchLayanan(): Promise<Layanan[]> {
  if (USE_MOCK) return MOCK_LAYANAN;
  const { data } = await apiClient.get<Layanan[]>('/layanan');
  return data;
}

/**
 * POST /antropometri — simpan hasil pengukuran.
 * PENTING: perhitungan z_score_* seharusnya dilakukan di backend memakai
 * tabel LMS resmi WHO, BUKAN dihitung kira-kira di frontend. Fungsi ini
 * hanya mengirim data mentah (BB/TB/LK) dan menerima balik hasil
 * interpretasi dari backend.
 */
export async function simpanAntropometri(
  payload: Pick<AntropometriPengukuran, 'kunjungan_id' | 'pasien_id' | 'usia_bulan' | 'berat_badan_kg' | 'tinggi_badan_cm' | 'lingkar_kepala_cm'>,
): Promise<AntropometriPengukuran> {
  if (USE_MOCK) {
    // Simulasi kasar HANYA untuk tampilan demo — jangan dipakai di produksi.
    const imt = payload.tinggi_badan_cm
      ? payload.berat_badan_kg / Math.pow(payload.tinggi_badan_cm / 100, 2)
      : undefined;
    return {
      ...payload,
      z_score_bb_u: -0.5,
      z_score_tb_u: -0.5,
      z_score_bb_tb: -0.3,
      z_score_lk_u: -0.7,
      interpretasi: imt ? 'Gizi baik (simulasi, bukan hasil WHO LMS sesungguhnya)' : undefined,
    };
  }
  const { data } = await apiClient.post<AntropometriPengukuran>('/antropometri', payload);
  return data;
}

/** GET /lab — daftar permintaan pemeriksaan lab & radiologi. */
export async function fetchPermintaanLab(): Promise<PermintaanLab[]> {
  if (USE_MOCK) return MOCK_LAB;
  const { data } = await apiClient.get<PermintaanLab[]>('/lab');
  return data;
}

/** PATCH /lab/:id/status — memperbarui status pemeriksaan. */
export async function ubahStatusLab(id: number, status: PermintaanLab['status']): Promise<PermintaanLab> {
  if (USE_MOCK) return { id, status } as PermintaanLab;
  const { data } = await apiClient.patch<PermintaanLab>(`/lab/${id}/status`, { status });
  return data;
}
