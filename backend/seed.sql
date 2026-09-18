-- Seed MedikaScale initial data
INSERT INTO roles (id, kode, nama_tampil, is_system) VALUES
(1, 'dokter', 'Dokter', true),
(2, 'perawat', 'Perawat', true),
(3, 'apoteker', 'Apoteker', true),
(4, 'lab_radiologi', 'Lab & Radiologi', true),
(5, 'admin', 'Admin', true)
ON CONFLICT (id) DO NOTHING;

SELECT setval('roles_id_seq', (SELECT MAX(id) FROM roles));

INSERT INTO permissions (id, kode, modul, deskripsi) VALUES
(1, 'antrian.view', 'antrian', 'Melihat daftar antrian'),
(2, 'antrian.prioritaskan', 'antrian', 'Menandai antrian sebagai prioritas'),
(3, 'antrian.ubah_status', 'antrian', 'Mengubah status alur antrian'),
(4, 'antropometri.input', 'antropometri', 'Memasukkan pengukuran antropometri anak'),
(5, 'arsip.view', 'arsip', 'Melihat lokasi rak dan tracking arsip rekam medis'),
(6, 'arsip.minta_pengiriman', 'arsip', 'Meminta pengiriman berkas rekam medis'),
(7, 'resep.kirim', 'resep', 'Mengirim pesan/resep obat ke apotek'),
(8, 'resep.proses', 'resep', 'Memproses dan menyiapkan resep obat'),
(9, 'lab.kelola', 'lab', 'Mengelola dan mengubah status pemeriksaan lab/radiologi')
ON CONFLICT (id) DO NOTHING;

SELECT setval('permissions_id_seq', (SELECT MAX(id) FROM permissions));

-- Role Permissions
INSERT INTO role_permissions (role_id, permission_id) VALUES
-- Dokter
(1, 1), (1, 3), (1, 7), (1, 5),
-- Perawat
(2, 1), (2, 2), (2, 3), (2, 4), (2, 5), (2, 6),
-- Apoteker
(3, 8),
-- Lab & Radiologi
(4, 9), (4, 5),
-- Admin
(5, 1), (5, 2), (5, 3), (5, 4), (5, 5), (5, 6), (5, 7), (5, 8), (5, 9)
ON CONFLICT DO NOTHING;

-- Users (Password: demo123 -> $2b$10$4D3QYyQenQ85JEjTeqdhDe0tz9oDsm2IKjdGK65D2pVwnENem08tO)
INSERT INTO users (id, role_id, nama, username, email, password_hash, no_telepon, aktif) VALUES
(1, 1, 'dr. Angga, Sp.A', 'dokter', 'dokter@medikascale.local', '$2b$10$4D3QYyQenQ85JEjTeqdhDe0tz9oDsm2IKjdGK65D2pVwnENem08tO', '08123456701', true),
(2, 2, 'Ns. Dewi Lestari', 'perawat', 'perawat@medikascale.local', '$2b$10$4D3QYyQenQ85JEjTeqdhDe0tz9oDsm2IKjdGK65D2pVwnENem08tO', '08123456702', true),
(3, 3, 'Apt. Ratna Wijaya', 'apoteker', 'apoteker@medikascale.local', '$2b$10$4D3QYyQenQ85JEjTeqdhDe0tz9oDsm2IKjdGK65D2pVwnENem08tO', '08123456703', true),
(4, 4, 'Analis Yoga Pratama', 'lab', 'lab@medikascale.local', '$2b$10$4D3QYyQenQ85JEjTeqdhDe0tz9oDsm2IKjdGK65D2pVwnENem08tO', '08123456704', true),
(5, 5, 'Administrator MedikaScale', 'admin', 'admin@medikascale.local', '$2b$10$4D3QYyQenQ85JEjTeqdhDe0tz9oDsm2IKjdGK65D2pVwnENem08tO', '08123456705', true)
ON CONFLICT (id) DO NOTHING;

SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- Layanan
INSERT INTO layanan (id, nama, aktif) VALUES
(1, 'SOAPIE', true),
(2, 'Vaksin', true),
(3, 'Konsul Tumbuh Kembang', true),
(4, 'Deteksi/Skrining Tahap 2', true),
(5, 'Konsul Makan', true)
ON CONFLICT (id) DO NOTHING;

SELECT setval('layanan_id_seq', (SELECT MAX(id) FROM layanan));

-- Pasien
INSERT INTO pasien (id, no_rm, nama, tanggal_lahir, jenis_kelamin, nama_wali, golongan_darah, no_telepon, alamat) VALUES
(1, 'RM-2023-004120', 'Ahmad Fauzi', '2023-05-10', 'Laki-laki', 'Bapak Ahmad', 'O', '081234567890', 'Jl. Merdeka No. 12'),
(2, 'RM-2022-009981', 'Siti Aminah', '2022-08-14', 'Perempuan', 'Ibu Aminah', 'A', '081234567891', 'Jl. Melati No. 5'),
(3, 'RM-2024-018472', 'Bilqis Nur Aisyah', '2025-03-18', 'Perempuan', 'Ibu Nur', 'B', '081234567892', 'Jl. Anggrek No. 8'),
(4, 'RM-2021-002210', 'Rangga Saputra', '2021-11-20', 'Laki-laki', 'Bapak Saputra', 'AB', '081234567893', 'Jl. Kenanga No. 20')
ON CONFLICT (id) DO NOTHING;

SELECT setval('pasien_id_seq', (SELECT MAX(id) FROM pasien));

-- Kunjungan Hari Ini
INSERT INTO kunjungan (id, no_kunjungan, pasien_id, layanan_id, dpjp_user_id, perawat_user_id, tanggal, poli, keluhan_utama, no_antrian, status_antrian, prioritas, created_at, updated_at) VALUES
(101, 'ENC-2026-09-18-0001', 1, 2, 1, 2, CURRENT_DATE, 'Poliklinik Anak', 'Jadwal vaksinasi DPT lanjutan', 'A01', 'kuning', false, CURRENT_DATE + TIME '09:10:00', CURRENT_DATE + TIME '09:10:00'),
(102, 'ENC-2026-09-18-0002', 2, 1, 1, 2, CURRENT_DATE, 'Poliklinik Anak', 'Batuk pilek sejak 2 hari', 'A02', 'putih', false, CURRENT_DATE + TIME '09:15:00', CURRENT_DATE + TIME '09:15:00'),
(103, 'ENC-2025-09-06-0031', 3, 3, 1, 2, CURRENT_DATE, 'Poliklinik Anak', 'Konsultasi kenaikan berat badan', 'A03', 'hijau', false, CURRENT_DATE + TIME '09:20:00', CURRENT_DATE + TIME '09:20:00'),
(104, 'ENC-2026-09-18-0004', 4, 4, 1, 2, CURRENT_DATE, 'Poliklinik Anak', 'Skrining perkembangan rutin', 'A04', 'putih', true, CURRENT_DATE + TIME '09:25:00', CURRENT_DATE + TIME '09:25:00')
ON CONFLICT (id) DO NOTHING;

SELECT setval('kunjungan_id_seq', (SELECT MAX(id) FROM kunjungan));
