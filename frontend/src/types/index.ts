export interface User {
  id: string;
  username: string;
  role_id: string;
  permissions: string[];
}

export interface Pasien {
  id: string;
  no_rm: string;
  nama: string;
  tanggal_lahir: string;
  no_telepon: string;
  alamat: string;
}

export interface Kunjungan {
  id: string;
  pasien_id: string;
  no_antrian: string;
  tanggal_kunjungan: string;
  poli: string;
  layanan: string;
  status_antrian: 'putih' | 'hijau' | 'kuning' | 'merah';
  prioritas: boolean;
  created_at: string;
  updated_at: string;
}

export interface AntrianLog {
  id: string;
  kunjungan_id: string;
  status_lama: string;
  status_baru: string;
  changed_by: string;
  changed_at: string;
}

export interface Antropometri {
  id: string;
  kunjungan_id: string;
  tinggi: number;
  berat: number;
  lingkar_kepala?: number;
  umur_bulan: number;
  created_by_user_id: string;
  created_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  message: string;
  code: string;
}
