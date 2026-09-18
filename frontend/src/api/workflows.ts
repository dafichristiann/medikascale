import type { ArsipPatientOption, LokasiArsip, MapArsip, Pemeriksaan, ResepLengkap, RiwayatArsip } from '@/types';
import { apiClient, USE_MOCK } from './client';

let resep: ResepLengkap[] = [
  { id: 1, kunjungan_id: 103, pasien: { nama: 'Bilqis Nur Aisyah', no_rm: 'RM-2024-018472' }, dokter: 'dr. Angga, Sp.A', dibuat_pada: '2026-09-18 09:35', status: 'dikirim', items: [{ nama_obat: 'Parasetamol drops 100mg/mL', dosis: '100 mg', jumlah: '1 botol', frekuensi: '3x sehari', aturan_pakai: 'Sesudah makan', instruksi: 'Bila demam' }] },
  { id: 2, kunjungan_id: 101, pasien: { nama: 'Ahmad Fauzi', no_rm: 'RM-2023-004120' }, dokter: 'dr. Angga, Sp.A', dibuat_pada: '2026-09-18 10:05', status: 'siap', items: [{ nama_obat: 'Amoksisilin sirup', dosis: '125 mg', jumlah: '1 botol', frekuensi: '3x sehari', aturan_pakai: 'Sesudah makan', instruksi: 'Habiskan' }] },
];
let pemeriksaan: Pemeriksaan[] = [
  { id: 1, kunjungan_id: 103, pasien: { nama: 'Bilqis Nur Aisyah', no_rm: 'RM-2024-018472' }, dokter: 'dr. Angga, Sp.A', jenis: 'Laboratorium', pemeriksaan: 'Darah rutin', catatan: 'Demam 3 hari', status: 'diproses' },
  { id: 2, kunjungan_id: 101, pasien: { nama: 'Ahmad Fauzi', no_rm: 'RM-2023-004120' }, dokter: 'dr. Angga, Sp.A', jenis: 'Radiologi', pemeriksaan: 'Rontgen toraks', catatan: 'Batuk produktif', status: 'hasil_siap', hasil: { nilai: 'Tidak tampak infiltrat', satuan: '-', nilai_rujukan: 'Normal', interpretasi: 'Dalam batas normal' } },
];
let lokasi: LokasiArsip[] = [
  { id: 1, lantai: 'Lantai 2', ruang: 'Ruang Arsip B', rak: 'Rak 5', baris: 'Baris 3', map_count: 1 },
  { id: 2, lantai: 'Lantai 2', ruang: 'Ruang Arsip A', rak: 'Rak 2', baris: 'Baris 1', map_count: 1 },
];
let maps: MapArsip[] = [
  { id: 1, pasien_id: 3, no_rm: 'RM-2024-018472', nama_pasien: 'Bilqis Nur Aisyah', no_map: 'MAP-00231', lokasi_id: 1, lantai: 'Lantai 2', ruang: 'Ruang Arsip B', rak: 'Rak 5', baris: 'Baris 3', kotak: 'Kotak 12', status: 'tersedia' },
  { id: 2, pasien_id: 1, no_rm: 'RM-2023-004120', nama_pasien: 'Ahmad Fauzi', no_map: 'MAP-00120', lokasi_id: 2, lantai: 'Lantai 2', ruang: 'Ruang Arsip A', rak: 'Rak 2', baris: 'Baris 1', kotak: 'Kotak 04', status: 'dipinjam' },
];
let riwayat: RiwayatArsip[] = [{ id: 1, map_id: 2, no_rm: 'RM-2023-004120', nama_pasien: 'Ahmad Fauzi', tindakan: 'Dipinjam', keterangan: 'Ke Poli Anak untuk pemeriksaan', petugas: 'Siti Rahma, A.Md.RMIK', waktu: '2026-09-18 08:40' }];
const copy = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

export const workflowApi = {
  resep: async () => copy(resep), resepById: async (id: number) => copy(resep.find((x) => x.id === id)),
  saveResep: async (data: Omit<ResepLengkap, 'id' | 'dibuat_pada'>) => { const item = { ...data, id: Date.now(), dibuat_pada: new Date().toLocaleString('id-ID') }; resep = [item, ...resep]; return copy(item); },
  statusResep: async (id: number, status: ResepLengkap['status']) => { const item = resep.find((x) => x.id === id); if (!item) throw new Error('Resep tidak ditemukan'); item.status = status; return copy(item); },
  pemeriksaan: async () => copy(pemeriksaan), pemeriksaanById: async (id: number) => copy(pemeriksaan.find((x) => x.id === id)),
  savePemeriksaan: async (data: Omit<Pemeriksaan, 'id'>) => { const item = { ...data, id: Date.now() }; pemeriksaan = [item, ...pemeriksaan]; return copy(item); },
  updatePemeriksaan: async (id: number, data: Partial<Pemeriksaan>) => { const item = pemeriksaan.find((x) => x.id === id); if (!item) throw new Error('Pemeriksaan tidak ditemukan'); Object.assign(item, data); return copy(item); },
  lokasi: async () => { if (!USE_MOCK) { const { data } = await apiClient.get<LokasiArsip[]>('/arsip/lokasi'); return data; } return copy(lokasi); },
  saveLokasi: async (data: Omit<LokasiArsip, 'id' | 'map_count'>) => { if (!USE_MOCK) { const { data: saved } = await apiClient.post('/arsip/lokasi', data); return saved; } const item = { ...data, id: Date.now(), map_count: 0 }; lokasi = [...lokasi, item]; return copy(item); },
  deleteLokasi: async (id: number) => { if (!USE_MOCK) { await apiClient.delete(`/arsip/lokasi/${id}`); return; } const item = lokasi.find((x) => x.id === id); if (!item || item.map_count) throw new Error('Lokasi masih digunakan oleh map arsip'); lokasi = lokasi.filter((x) => x.id !== id); },
  maps: async (q = '') => { if (!USE_MOCK) { const { data } = await apiClient.get<MapArsip[]>('/arsip/maps', { params: { q } }); return data; } return copy(maps.filter((x) => `${x.no_rm} ${x.no_map} ${x.nama_pasien} ${x.lantai} ${x.ruang}`.toLowerCase().includes(q.toLowerCase()))); },
  patients: async () => { if (!USE_MOCK) { const { data } = await apiClient.get<ArsipPatientOption[]>('/arsip/pasien'); return data; } return copy(maps.map((x) => ({ id: x.pasien_id, nama: x.nama_pasien, no_rm: x.no_rm }))); },
  saveMap: async (data: { nomor_map: string; nomor_dokumen: string; pasien_id: number; lokasi_id?: number }) => { if (!USE_MOCK) { const { data: saved } = await apiClient.post<MapArsip>('/arsip/maps', data); return saved; } const patient = maps.find((x) => x.pasien_id === data.pasien_id); const location = data.lokasi_id ? lokasi.find((x) => x.id === data.lokasi_id) : undefined; if (!patient) throw new Error('Pasien tidak ditemukan'); const item: MapArsip = { id: Date.now(), ...data, no_map: data.nomor_map, no_rm: patient.no_rm, nama_pasien: patient.nama_pasien, lantai: location?.lantai ?? '-', ruang: location?.ruang ?? '-', rak: location?.rak ?? '-', baris: location?.baris ?? '-', kotak: data.nomor_dokumen, status: 'tersedia' }; maps = [item, ...maps]; return copy(item); },
  riwayat: async () => { if (!USE_MOCK) { const { data } = await apiClient.get<RiwayatArsip[]>('/arsip/riwayat'); return data; } return copy(riwayat); },
  transaksiArsip: async (mapId: number, tindakan: RiwayatArsip['tindakan'], keterangan: string, petugas: string) => { if (!USE_MOCK) { const endpoint = tindakan === 'Dipinjam' ? 'pinjam' : 'kembalikan'; const { data } = await apiClient.post(`/arsip/maps/${mapId}/${endpoint}`, { keterangan }); return data; } const map = maps.find((x) => x.id === mapId); if (!map) throw new Error('Map tidak ditemukan'); map.status = tindakan === 'Dipinjam' ? 'dipinjam' : 'dikembalikan'; const entry = { id: Date.now(), map_id: mapId, no_rm: map.no_rm, nama_pasien: map.nama_pasien, tindakan, keterangan, petugas, waktu: new Date().toLocaleString('id-ID') }; riwayat = [entry, ...riwayat]; return copy(entry); },
};
