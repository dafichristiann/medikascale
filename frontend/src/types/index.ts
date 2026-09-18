// Tipe-tipe ini dibuat mengikuti skema database yang sudah disepakati
// (lihat dokumen "Skema Inti, RBAC & Alur Login/Routing"). Field & nama
// sengaja disamakan persis dengan kolom di database supaya gampang
// dipetakan saat backend NestJS sudah menyediakan endpoint aslinya.

export type StatusAntrian = 'putih' | 'hijau' | 'kuning' | 'merah' | 'selesai';

export interface Role {
  id: number;
  kode: string; // dokter | perawat | apoteker | lab_radiologi | admin
  nama_tampil: string;
  is_system: boolean;
}

export interface Permission {
  id: number;
  kode: string; // contoh: 'antrian.view', 'antrian.prioritaskan'
  modul: string;
  deskripsi?: string;
}

export interface AuthenticatedUser {
  id: number;
  nama: string;
  username: string;
  role: Pick<Role, 'id' | 'kode' | 'nama_tampil'>;
  permissions: string[]; // daftar permission.kode milik user (hasil join role_permissions)
}

export interface Pasien {
  id: number;
  no_rm: string;
  nama: string;
  tanggal_lahir: string;
  jenis_kelamin: 'Laki-laki' | 'Perempuan';
  nama_wali?: string;
  golongan_darah?: string;
  no_telepon?: string;
  alamat?: string;
}

export interface Layanan {
  id: number;
  nama: string;
  aktif: boolean;
}

export interface Kunjungan {
  id: number;
  no_kunjungan: string;
  pasien: Pick<Pasien, 'id' | 'nama' | 'no_rm'> & Partial<Pick<Pasien, 'jenis_kelamin' | 'tanggal_lahir'>>;
  layanan: Pick<Layanan, 'id' | 'nama'>;
  dpjp_user_id?: number;
  perawat_user_id?: number;
  tanggal: string;
  poli?: string;
  keluhan_utama?: string;
  no_antrian: string;
  status_antrian: StatusAntrian;
  prioritas: boolean;
  created_at: string;
  updated_at: string;
}

export interface AntropometriPengukuran {
  id?: number;
  kunjungan_id: number;
  pasien_id: number;
  usia_bulan: number;
  berat_badan_kg: number;
  tinggi_badan_cm: number;
  lingkar_kepala_cm?: number;
  z_score_bb_u?: number;
  z_score_tb_u?: number;
  z_score_bb_tb?: number;
  z_score_lk_u?: number;
  interpretasi?: string;
  created_at?: string;
}

export interface ResepItem {
  nama_obat: string;
  aturan_pakai: string;
  jumlah: string;
}

export interface PesanResep {
  id: number;
  kunjungan_id: number;
  kunjungan?: Kunjungan;
  dokter_user_id?: number;
  apoteker_user_id?: number;
  dari_user: string;
  ke_user: string;
  isi_pesan: string;
  resep_item?: ResepItem[];
  status: 'terkirim' | 'menunggu' | 'disiapkan' | 'siap_diambil' | 'diserahkan' | 'selesai';
  waktu: string;
}

export interface ArsipLokasi {
  pasien_id: number;
  no_rm: string;
  nama_pasien: string;
  lantai: string;
  ruang: string;
  rak: string;
  baris: string;
  kotak: string;
  status: 'tersedia' | 'dipinjam' | 'dikembalikan' | 'dalam_pengiriman';
}

export interface ArsipTrackingStep {
  label: string;
  keterangan: string;
  waktu?: string;
  selesai: boolean;
  aktif: boolean;
}

export interface PermintaanLab {
  id: number;
  pasien: Pick<Pasien, 'no_rm' | 'nama'>;
  pemeriksaan: string;
  diminta_oleh: string;
  status: 'menunggu' | 'diproses' | 'hasil_siap';
}

export interface DashboardSummary {
  tanggal: string;
  total_pasien: number;
  menunggu_putih: number;
  ditimbang_hijau: number;
  sedang_diperiksa_kuning: number;
  dapat_resep_merah: number;
  prioritas_aktif: number;
  layanan_breakdown: Record<string, number>;
}

export interface NotifikasiItem {
  id: number;
  user_id?: number;
  role_kode?: string;
  judul: string;
  pesan: string;
  tipe: 'info' | 'antrian' | 'resep' | 'lab' | 'arsip' | 'darurat';
  tautan?: string;
  dibaca: boolean;
  created_at: string;
}

export interface ResepItemInput {
  nama_obat: string;
  dosis: string;
  kuantitas: number;
  aturan_pakai: string;
}

export interface LabRequestInput {
  tipe: 'lab' | 'radiologi';
  jenis_pemeriksaan: string;
  catatan?: string;
}

export interface SimpanPemeriksaanPayload {
  kunjungan_id: number;
  keluhan: string;
  pemeriksaan_fisik?: string;
  diagnosis: string;
  catatan_terapi?: string;
  resep_items?: ResepItemInput[];
  lab_requests?: LabRequestInput[];
}

export interface DetailKunjungan360 {
  kunjungan: Kunjungan;
  pasien: Pasien;
  antropometri: AntropometriPengukuran | null;
  riwayat_antropometri: AntropometriPengukuran[];
  pemeriksaan: {
    id: number;
    kunjungan_id: number;
    keluhan: string;
    pemeriksaan_fisik: string;
    diagnosis: string;
    catatan_terapi: string;
    dokter?: { id: number; nama: string };
    created_at: string;
  } | null;
  riwayat_pemeriksaan: any[];
  resep: any[];
  penunjang: any[];
  arsip: any | null;
  riwayat_kunjungan: any[];
}

export interface AdminUser {
  id: number;
  nama: string;
  username: string;
  email?: string;
  aktif: boolean;
  role_id: number;
  role: Role;
  no_telepon?: string;
  created_at: string;
}

export interface AdminRole extends Role {
  permissions: Permission[];
}
export type StatusResepBaru = 'dibuat' | 'dikirim' | 'diproses' | 'siap' | 'selesai' | 'dibatalkan';
export interface ResepLengkap {
  id: number;
  kunjungan_id: number;
  pasien: Pick<Pasien, 'nama' | 'no_rm'>;
  dokter: string;
  dibuat_pada: string;
  status: StatusResepBaru;
  items: Array<ResepItem & { dosis: string; frekuensi: string; instruksi: string }>;
}

export type StatusPemeriksaan = 'diminta' | 'diproses' | 'hasil_siap' | 'direview' | 'dikembalikan';
export interface Pemeriksaan {
  id: number;
  kunjungan_id: number;
  pasien: Pick<Pasien, 'nama' | 'no_rm'>;
  dokter: string;
  jenis: 'Laboratorium' | 'Radiologi';
  pemeriksaan: string;
  catatan: string;
  status: StatusPemeriksaan;
  hasil?: { nilai: string; satuan: string; nilai_rujukan: string; interpretasi: string };
}

export interface LokasiArsip { id: number; lantai: string; ruang: string; rak: string; baris: string; map_count: number }
export interface MapArsip extends ArsipLokasi { id: number; no_map: string; lokasi_id?: number }
export interface ArsipPatientOption { id: number; nama: string; no_rm: string }
export interface RiwayatArsip { id: number; map_id: number; no_rm: string; nama_pasien: string; tindakan: 'Dipinjam' | 'Dikembalikan'; keterangan: string; petugas: string; waktu: string }
