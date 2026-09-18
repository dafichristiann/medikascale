import { apiClient, USE_MOCK } from './client';
import type { DashboardSummary } from '@/types';

export async function fetchDashboardSummary(tanggal?: string): Promise<DashboardSummary> {
  if (USE_MOCK) {
    return {
      tanggal: tanggal || new Date().toISOString().slice(0, 10),
      total_pasien: 4,
      menunggu_putih: 2,
      ditimbang_hijau: 1,
      sedang_diperiksa_kuning: 1,
      dapat_resep_merah: 0,
      prioritas_aktif: 1,
      layanan_breakdown: {
        SOAPIE: 1,
        Vaksin: 1,
        'Konsul Tumbuh Kembang': 1,
        'Deteksi/Skrining Tahap 2': 1,
      },
    };
  }
  const { data } = await apiClient.get<DashboardSummary>('/dashboard/summary', {
    params: tanggal ? { tanggal } : undefined,
  });
  return data;
}
