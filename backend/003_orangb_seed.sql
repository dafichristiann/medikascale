-- Seed Modul Orang B: Roles, Permissions, Role Permissions, Users, & Sample Data

-- 1. Pastikan Role Baru
INSERT INTO roles (id, kode, nama_tampil, is_system) VALUES
(6, 'arsiparis', 'Arsiparis', true)
ON CONFLICT (id) DO UPDATE SET nama_tampil = EXCLUDED.nama_tampil;

SELECT setval('roles_id_seq', (SELECT MAX(id) FROM roles));

-- 2. Permissions Baru
INSERT INTO permissions (kode, modul, deskripsi) VALUES
-- Klinik & Tumbuh Kembang (5 modul baru)
('sophi.view', 'klinik', 'Melihat modul SOAPIE / SOPHI'),
('vaksin.view', 'klinik', 'Melihat jadwal dan pencatatan vaksinasi'),
('tumbuh_kembang.view', 'klinik', 'Melihat konsultasi tumbuh kembang anak'),
('denver_ii.view', 'klinik', 'Melihat skrining perkembangan Denver II'),
('konsultasi_makan.view', 'klinik', 'Melihat konsultasi makan & gizi anak'),

-- Arsip Rekam Medis
('arsip.manage', 'arsip', 'Mengelola lokasi rak dan map berkas fisik'),
('arsip.pinjam', 'arsip', 'Meminjam berkas map rekam medis'),
('arsip.kembalikan', 'arsip', 'Mengembalikan berkas map rekam medis'),

-- E-Resep
('resep.view', 'resep', 'Melihat daftar dan detail resep obat'),
('resep.create', 'resep', 'Membuat resep elektronik baru'),
('resep.send', 'resep', 'Mengirim resep ke apotek'),
('resep.process', 'resep', 'Memproses penyiapan resep obat'),
('resep.complete', 'resep', 'Menyelesaikan peracikan resep obat'),
('resep.cancel', 'resep', 'Membatalkan resep obat'),

-- Pemeriksaan Lab & Radiologi
('pemeriksaan.view', 'pemeriksaan', 'Melihat daftar dan hasil pemeriksaan lab/radiologi'),
('pemeriksaan.create', 'pemeriksaan', 'Membuat permintaan pemeriksaan lab/radiologi'),
('pemeriksaan.process', 'pemeriksaan', 'Memproses sampel dan input hasil lab/radiologi'),
('pemeriksaan.review', 'pemeriksaan', 'Meninjau dan menyetujui hasil lab/radiologi')
ON CONFLICT (kode) DO NOTHING;

SELECT setval('permissions_id_seq', (SELECT MAX(id) FROM permissions));

-- 3. Hubungkan Role & Permissions
-- Helper function untuk insert role_permissions by kode
DO $$
DECLARE
    r_dokter INT := 1;
    r_perawat INT := 2;
    r_apoteker INT := 3;
    r_lab INT := 4;
    r_admin INT := 5;
    r_arsiparis INT := 6;
    perm RECORD;
BEGIN
    -- Dokter
    FOR perm IN SELECT id FROM permissions WHERE kode IN (
        'antrian.view', 'antrian.ubah_status', 'resep.kirim', 'resep.view', 'resep.create', 'resep.send', 'resep.cancel',
        'pemeriksaan.view', 'pemeriksaan.create', 'pemeriksaan.review', 'lab.kelola',
        'arsip.view', 'arsip.pinjam',
        'sophi.view', 'vaksin.view', 'tumbuh_kembang.view', 'denver_ii.view', 'konsultasi_makan.view'
    ) LOOP
        INSERT INTO role_permissions (role_id, permission_id) VALUES (r_dokter, perm.id) ON CONFLICT DO NOTHING;
    END LOOP;

    -- Perawat
    FOR perm IN SELECT id FROM permissions WHERE kode IN (
        'antrian.view', 'antrian.prioritaskan', 'antrian.ubah_status', 'antropometri.input',
        'arsip.view', 'arsip.minta_pengiriman', 'arsip.pinjam',
        'resep.view', 'pemeriksaan.view',
        'sophi.view', 'vaksin.view', 'tumbuh_kembang.view', 'denver_ii.view', 'konsultasi_makan.view'
    ) LOOP
        INSERT INTO role_permissions (role_id, permission_id) VALUES (r_perawat, perm.id) ON CONFLICT DO NOTHING;
    END LOOP;

    -- Apoteker
    FOR perm IN SELECT id FROM permissions WHERE kode IN (
        'resep.proses', 'resep.view', 'resep.process', 'resep.complete', 'resep.cancel', 'arsip.view'
    ) LOOP
        INSERT INTO role_permissions (role_id, permission_id) VALUES (r_apoteker, perm.id) ON CONFLICT DO NOTHING;
    END LOOP;

    -- Lab & Radiologi
    FOR perm IN SELECT id FROM permissions WHERE kode IN (
        'lab.kelola', 'pemeriksaan.view', 'pemeriksaan.process', 'pemeriksaan.create', 'arsip.view'
    ) LOOP
        INSERT INTO role_permissions (role_id, permission_id) VALUES (r_lab, perm.id) ON CONFLICT DO NOTHING;
    END LOOP;

    -- Arsiparis
    FOR perm IN SELECT id FROM permissions WHERE kode IN (
        'arsip.view', 'arsip.manage', 'arsip.pinjam', 'arsip.kembalikan', 'arsip.minta_pengiriman'
    ) LOOP
        INSERT INTO role_permissions (role_id, permission_id) VALUES (r_arsiparis, perm.id) ON CONFLICT DO NOTHING;
    END LOOP;

    -- Admin (Semua permissions)
    FOR perm IN SELECT id FROM permissions LOOP
        INSERT INTO role_permissions (role_id, permission_id) VALUES (r_admin, perm.id) ON CONFLICT DO NOTHING;
    END LOOP;
END $$;

-- 4. User Demo Baru (Arsiparis)
INSERT INTO users (id, role_id, nama, username, email, password_hash, no_telepon, aktif) VALUES
(5, 6, 'Siti Rahma, A.Md.RMIK', 'arsiparis', 'arsiparis@medikascale.local', '$2b$10$4D3QYyQenQ85JEjTeqdhDe0tz9oDsm2IKjdGK65D2pVwnENem08tO', '08123456705', true)
ON CONFLICT (id) DO NOTHING;

SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- 5. Data Sampel: Lokasi Arsip & Map Berkas
INSERT INTO arsip_lokasi (id, lantai, ruang, rak, baris, keterangan, aktif, created_by_user_id) VALUES
(1, 'Lantai 2', 'Ruang Arsip A', 'Rak 1', 'Baris 1', 'Arsip Aktif Poliklinik Anak', true, 1),
(2, 'Lantai 2', 'Ruang Arsip A', 'Rak 1', 'Baris 2', 'Arsip Aktif Poliklinik Anak', true, 1),
(3, 'Lantai 2', 'Ruang Arsip B', 'Rak 2', 'Baris 1', 'Arsip Khusus Vaksin & Bayi Baru Lahir', true, 1)
ON CONFLICT (id) DO NOTHING;

SELECT setval('arsip_lokasi_id_seq', (SELECT MAX(id) FROM arsip_lokasi));

INSERT INTO arsip_map (id, nomor_map, nomor_dokumen, pasien_id, lokasi_id, status) VALUES
(1, 'MAP-2023-001', 'DOK-RM-004120', 1, 1, 'tersedia'),
(2, 'MAP-2022-002', 'DOK-RM-009981', 2, 1, 'tersedia'),
(3, 'MAP-2024-003', 'DOK-RM-018472', 3, 2, 'dipinjam'),
(4, 'MAP-2021-004', 'DOK-RM-002210', 4, 3, 'tersedia')
ON CONFLICT (id) DO NOTHING;

SELECT setval('arsip_map_id_seq', (SELECT MAX(id) FROM arsip_map));

-- Riwayat Pinjam untuk MAP-2024-003 (Pasien #3 An. Bilqis)
INSERT INTO arsip_pinjam (id, map_id, peminjam_user_id, tanggal_pinjam, tanggal_kembali, status, keterangan) VALUES
(1, 3, 1, now() - interval '2 hours', NULL, 'dipinjam', 'Peminjaman berkas rekam medis untuk konsultasi tumbuh kembang dokter spesialis anak')
ON CONFLICT (id) DO NOTHING;

SELECT setval('arsip_pinjam_id_seq', (SELECT MAX(id) FROM arsip_pinjam));

INSERT INTO arsip_pinjam_detail (id, pinjam_id, nomor_dokumen, nama_dokumen, keterangan) VALUES
(1, 1, 'DOK-RM-018472-A', 'Lembar Ringkasan Masuk & Keluar', 'Berkas utama rekam medis'),
(2, 1, 'DOK-RM-018472-B', 'Grafik Pertumbuhan KMS & WHO', 'Kurva pemantauan berat dan tinggi badan')
ON CONFLICT (id) DO NOTHING;

SELECT setval('arsip_pinjam_detail_id_seq', (SELECT MAX(id) FROM arsip_pinjam_detail));

-- 6. Data Sampel: E-Resep
INSERT INTO resep (id, nomor_resep, kunjungan_id, pasien_id, dokter_id, status, catatan, tanggal_dikirim) VALUES
(1, 'RSP-2026-0918-0001', 103, 3, 1, 'dikirim', 'Harap disiapkan racikan parasetamol drops dan zinc', now() - interval '30 minutes')
ON CONFLICT (id) DO NOTHING;

SELECT setval('resep_id_seq', (SELECT MAX(id) FROM resep));

INSERT INTO resep_item (id, resep_id, kode_obat, nama_obat, dosis, jumlah, frekuensi, aturan, instruksi) VALUES
(1, 1, 'OBT-001', 'Parasetamol Drops 100mg/mL', '100mg/mL', '1 botol (15 mL)', '3-4x sehari', 'Bila demam di atas 38C', 'Diberikan sesudah makan'),
(2, 1, 'OBT-002', 'Zinc Sirup 20mg/5mL', '20mg/5mL', '1 botol (60 mL)', '1x sehari', '1 sendok takar (5 mL)', 'Dihabiskan selama 10 hari berturut-turut'),
(3, 1, 'OBT-003', 'NaCl 0.9% Nasal Drops', '0.9%', '1 botol (30 mL)', '2x sehari', '2 tetes lubang hidung', 'Gunakan saat hidung tersumbat')
ON CONFLICT (id) DO NOTHING;

SELECT setval('resep_item_id_seq', (SELECT MAX(id) FROM resep_item));

-- 7. Data Sampel: Pemeriksaan Lab & Radiologi
INSERT INTO pemeriksaan (id, nomor_pemeriksaan, jenis, kunjungan_id, pasien_id, dokter_id, status, catatan) VALUES
(1, 'LAB-2026-0918-0001', 'laboratorium', 103, 3, 1, 'diproses', 'Pemeriksaan darah lengkap skrining anemia defisiensi besi'),
(2, 'RAD-2026-0918-0001', 'radiologi', 101, 1, 1, 'diminta', 'Rontgen toraks PA evaluasi batuk kronis')
ON CONFLICT (id) DO NOTHING;

SELECT setval('pemeriksaan_id_seq', (SELECT MAX(id) FROM pemeriksaan));

INSERT INTO pemeriksaan_item (id, pemeriksaan_id, kode_item, nama_item, satuan, nilai_referensi, catatan) VALUES
(1, 1, 'ITM-HB', 'Hemoglobin (Hb)', 'g/dL', '11.0 - 14.0', 'Metode otomatis'),
(2, 1, 'ITM-LEU', 'Leukosit', '/uL', '5.000 - 12.000', 'Metode otomatis'),
(3, 1, 'ITM-TRO', 'Trombosit', '/uL', '150.000 - 450.000', 'Metode otomatis'),
(4, 2, 'ITM-RXT', 'Foto Rontgen Toraks PA/AP', 'view', 'Normal cor dan pulmo', 'Proyeksi standar anak')
ON CONFLICT (id) DO NOTHING;

SELECT setval('pemeriksaan_item_id_seq', (SELECT MAX(id) FROM pemeriksaan_item));

INSERT INTO pemeriksaan_hasil (id, pemeriksaan_id, pemeriksaan_item_id, nilai, satuan, interpretasi, petugas_id, dokter_tinjau_id, status, tanggal_diperiksa) VALUES
(1, 1, 1, '12.4', 'g/dL', 'Normal', 4, 1, 'diproses', now() - interval '15 minutes'),
(2, 1, 2, '8.200', '/uL', 'Normal', 4, 1, 'diproses', now() - interval '15 minutes'),
(3, 1, 3, '280.000', '/uL', 'Normal', 4, 1, 'diproses', now() - interval '15 minutes')
ON CONFLICT (id) DO NOTHING;

SELECT setval('pemeriksaan_hasil_id_seq', (SELECT MAX(id) FROM pemeriksaan_hasil));

INSERT INTO pemeriksaan_log (id, pemeriksaan_id, status_lama, status_baru, changed_by_user_id, keterangan) VALUES
(1, 1, 'diminta', 'diterima', 4, 'Sampel darah kapiler diterima di loket laboratorium'),
(2, 1, 'diterima', 'diproses', 4, 'Sampel sedang dianalisis mesin hematology analyzer')
ON CONFLICT (id) DO NOTHING;

SELECT setval('pemeriksaan_log_id_seq', (SELECT MAX(id) FROM pemeriksaan_log));
