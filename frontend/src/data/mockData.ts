import type {
  AuthenticatedUser,
  Kunjungan,
  Layanan,
  PesanResep,
  ArsipLokasi,
  ArsipTrackingStep,
  PermintaanLab,
} from '@/types';

// ---------------------------------------------------------------------------
// Akun demo. Password untuk semuanya: "demo123" (dicek apa adanya di mock,
// TIDAK merepresentasikan cara hash password yang sesungguhnya di backend).
// permissions di sini meniru hasil JOIN role_permissions + permissions
// yang nantinya dikembalikan NestJS setelah login sungguhan.
// ---------------------------------------------------------------------------
export const MOCK_USERS: Array<AuthenticatedUser & { username: string; password: string }> = [
  {
    id: 1,
    nama: 'dr. Angga, Sp.A',
    username: 'dokter',
    password: 'demo123',
    role: { id: 1, kode: 'dokter', nama_tampil: 'Dokter' },
    permissions: ['antrian.view', 'antrian.ubah_status', 'resep.kirim', 'arsip.view'],
  },
  {
    id: 2,
    nama: 'Ns. Dewi Lestari',
    username: 'perawat',
    password: 'demo123',
    role: { id: 2, kode: 'perawat', nama_tampil: 'Perawat' },
    permissions: [
      'antrian.view',
      'antrian.prioritaskan',
      'antrian.ubah_status',
      'antropometri.input',
      'arsip.view',
      'arsip.minta_pengiriman',
    ],
  },
  {
    id: 3,
    nama: 'Apt. Ratna Wijaya',
    username: 'apoteker',
    password: 'demo123',
    role: { id: 3, kode: 'apoteker', nama_tampil: 'Apoteker' },
    permissions: ['resep.proses'],
  },
  {
    id: 4,
    nama: 'Analis Yoga Pratama',
    username: 'lab',
    password: 'demo123',
    role: { id: 4, kode: 'lab_radiologi', nama_tampil: 'Lab & Radiologi' },
    permissions: ['lab.kelola', 'arsip.view'],
  },
];

export const MOCK_LAYANAN: Layanan[] = [
  { id: 1, nama: 'SOAPIE', aktif: true },
  { id: 2, nama: 'Vaksin', aktif: true },
  { id: 3, nama: 'Konsul Tumbuh Kembang', aktif: true },
  { id: 4, nama: 'Deteksi/Skrining Tahap 2', aktif: true },
  { id: 5, nama: 'Konsul Makan', aktif: true },
];

export const MOCK_KUNJUNGAN: Kunjungan[] = [
  {
    id: 101,
    no_kunjungan: 'ENC-2026-09-18-0001',
    pasien: { id: 1, nama: 'Ahmad Fauzi', no_rm: 'RM-2023-004120' },
    layanan: { id: 2, nama: 'Vaksin' },
    tanggal: '2026-09-18',
    poli: 'Poliklinik Anak',
    no_antrian: 'A01',
    status_antrian: 'kuning',
    prioritas: false,
    created_at: '2026-09-18T09:10:00Z',
    updated_at: '2026-09-18T09:10:00Z',
  },
  {
    id: 102,
    no_kunjungan: 'ENC-2026-09-18-0002',
    pasien: { id: 2, nama: 'Siti Aminah', no_rm: 'RM-2022-009981' },
    layanan: { id: 1, nama: 'SOAPIE' },
    tanggal: '2026-09-18',
    poli: 'Poliklinik Anak',
    no_antrian: 'A02',
    status_antrian: 'putih',
    prioritas: false,
    created_at: '2026-09-18T09:15:00Z',
    updated_at: '2026-09-18T09:15:00Z',
  },
  {
    id: 103,
    no_kunjungan: 'ENC-2025-09-06-0031',
    pasien: { id: 3, nama: 'Bilqis Nur Aisyah', no_rm: 'RM-2024-018472' },
    layanan: { id: 3, nama: 'Konsul Tumbuh Kembang' },
    tanggal: '2026-09-18',
    poli: 'Poliklinik Anak',
    no_antrian: 'A03',
    status_antrian: 'hijau',
    prioritas: false,
    created_at: '2026-09-18T09:20:00Z',
    updated_at: '2026-09-18T09:20:00Z',
  },
  {
    id: 104,
    no_kunjungan: 'ENC-2026-09-18-0004',
    pasien: { id: 4, nama: 'Rangga Saputra', no_rm: 'RM-2021-002210' },
    layanan: { id: 4, nama: 'Deteksi/Skrining Tahap 2' },
    tanggal: '2026-09-18',
    poli: 'Poliklinik Anak',
    no_antrian: 'A04',
    status_antrian: 'putih',
    prioritas: true,
    created_at: '2026-09-18T09:25:00Z',
    updated_at: '2026-09-18T09:25:00Z',
  },
];

export const MOCK_RESEP_THREAD: PesanResep[] = [
  {
    id: 1,
    kunjungan_id: 103,
    dari_user: 'dr. Angga, Sp.A',
    ke_user: 'Apt. Ratna Wijaya',
    isi_pesan: 'Tolong siapkan resep untuk An. Bilqis ya.',
    resep_item: [
      { nama_obat: 'Parasetamol drops 100mg/mL', aturan_pakai: 'Tiap 6 jam bila demam', jumlah: '1 botol' },
      { nama_obat: 'NaCl 0,9% nasal drops', aturan_pakai: '2 tetes/lubang hidung', jumlah: '1 botol' },
      { nama_obat: 'Zinc sirup 20mg/5mL', aturan_pakai: '1x sehari, 10 hari', jumlah: '1 botol' },
    ],
    status: 'terkirim',
    waktu: '2026-09-18T09:35:00Z',
  },
  {
    id: 2,
    kunjungan_id: 103,
    dari_user: 'Apt. Ratna Wijaya',
    ke_user: 'dr. Angga, Sp.A',
    isi_pesan: 'Diterima, sedang disiapkan di racikan 2. Estimasi 10 menit.',
    status: 'disiapkan',
    waktu: '2026-09-18T09:37:00Z',
  },
  {
    id: 3,
    kunjungan_id: 103,
    dari_user: 'Apt. Ratna Wijaya',
    ke_user: 'dr. Angga, Sp.A',
    isi_pesan: 'Resep sudah siap diambil di loket apotek.',
    status: 'siap_diambil',
    waktu: '2026-09-18T09:47:00Z',
  },
];

export const MOCK_ARSIP: ArsipLokasi[] = [
  {
    pasien_id: 3,
    no_rm: 'RM-2024-018472',
    nama_pasien: 'Bilqis Nur Aisyah',
    lantai: 'Lantai 2',
    ruang: 'Ruang Arsip B',
    rak: 'Rak 5',
    baris: 'Baris 3',
    kotak: 'Kotak 12',
    status: 'tersedia',
  },
];

export const MOCK_TRACKING: ArsipTrackingStep[] = [
  { label: 'Diminta', keterangan: 'Perawat Lt.1 meminta RM-2024-018472', waktu: '09:02', selesai: true, aktif: false },
  { label: 'Dikemas & diberi barcode', keterangan: 'Petugas arsip Lt.2 memindai keluar berkas', waktu: '09:06', selesai: true, aktif: false },
  { label: 'Dalam perjalanan', keterangan: 'Kurir: Pak Dedi, Lt.2 → Lt.3, dipindai di lift', waktu: '09:09', selesai: false, aktif: true },
  { label: 'Diterima & diverifikasi', keterangan: 'Menunggu pindai masuk di Poli Anak Lt.3', selesai: false, aktif: false },
];

export const MOCK_LAB: PermintaanLab[] = [
  { id: 1, pasien: { no_rm: 'RM-2024-018472', nama: 'Bilqis Nur Aisyah' }, pemeriksaan: 'Darah rutin', diminta_oleh: 'dr. Angga, Sp.A', status: 'diproses' },
  { id: 2, pasien: { no_rm: 'RM-2023-004120', nama: 'Ahmad Fauzi' }, pemeriksaan: 'Rontgen toraks', diminta_oleh: 'dr. Angga, Sp.A', status: 'menunggu' },
  { id: 3, pasien: { no_rm: 'RM-2022-009981', nama: 'Siti Aminah' }, pemeriksaan: 'Urinalisis', diminta_oleh: 'dr. Angga, Sp.A', status: 'hasil_siap' },
];
