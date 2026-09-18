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

/** GET /antropometri/kunjungan/:kunjunganId — riwayat pengukuran antropometri pasien. */
export async function fetchAntropometriByKunjungan(kunjunganId: number): Promise<AntropometriPengukuran[]> {
  if (USE_MOCK) {
    return [
      {
        kunjungan_id: kunjunganId,
        pasien_id: 3,
        usia_bulan: 18,
        berat_badan_kg: 10.2,
        tinggi_badan_cm: 79.5,
        lingkar_kepala_cm: 45.8,
        z_score_bb_u: 0,
        z_score_tb_u: -0.44,
        z_score_bb_tb: 0.22,
        z_score_lk_u: -0.3,
        interpretasi: 'Gizi baik, perawakan normal, normosefali',
      },
    ];
  }
  const { data } = await apiClient.get<AntropometriPengukuran[]>(`/antropometri/kunjungan/${kunjunganId}`);
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

/** PATCH /lab/:id/hasil — analis menginputkan hasil dan nilai rujukan lab/radiologi */
export async function inputHasilLab(
  id: number,
  payload: { hasil_pemeriksaan: string; nilai_rujukan?: string },
): Promise<any> {
  if (USE_MOCK) return { id, status: 'selesai', ...payload };
  const { data } = await apiClient.patch(`/lab/${id}/hasil`, payload);
  return data;
}

/** POST /klinis/pemeriksaan — simpan pemeriksaan dokter 360, e-resep, dan permintaan lab */
export async function simpanPemeriksaanDokter(payload: import('@/types').SimpanPemeriksaanPayload): Promise<any> {
  if (USE_MOCK) {
    return {
      success: true,
      pemeriksaan: { id: Date.now(), ...payload },
      resep: payload.resep_items && payload.resep_items.length > 0 ? { id: Date.now(), status: 'menunggu' } : null,
      status_antrian: payload.resep_items && payload.resep_items.length > 0 ? 'merah' : 'kuning',
    };
  }
  const { data } = await apiClient.post('/klinis/pemeriksaan', payload);
  return data;
}

/** GET /klinis/kunjungan/:id/detail — ambil data 360 rekam medis kunjungan pasien */
export async function fetchDetailKunjungan(kunjunganId: number): Promise<import('@/types').DetailKunjungan360> {
  if (USE_MOCK) {
    return {
      kunjungan: {} as any,
      pasien: {} as any,
      antropometri: null,
      riwayat_antropometri: [],
      pemeriksaan: null,
      riwayat_pemeriksaan: [],
      resep: [],
      penunjang: [],
      arsip: null,
      riwayat_kunjungan: [],
    };
  }
  const { data } = await apiClient.get<import('@/types').DetailKunjungan360>(`/klinis/kunjungan/${kunjunganId}/detail`);
  return data;
}
