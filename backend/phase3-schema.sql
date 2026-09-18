-- Phase 3 Operational Medical Workflow Schema Additions

-- 1. Doctor Examination Table
CREATE TABLE IF NOT EXISTS pemeriksaan_dokter (
    id SERIAL PRIMARY KEY,
    kunjungan_id INT NOT NULL REFERENCES kunjungan(id) ON DELETE CASCADE,
    dokter_user_id INT REFERENCES users(id),
    keluhan TEXT,
    pemeriksaan_fisik TEXT,
    diagnosis VARCHAR(255) NOT NULL,
    catatan_terapi TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pemeriksaan_kunjungan ON pemeriksaan_dokter(kunjungan_id);

-- 2. Prescription Table (Persistent & Workflow Ready)
CREATE TABLE IF NOT EXISTS resep_obat (
    id SERIAL PRIMARY KEY,
    kunjungan_id INT NOT NULL REFERENCES kunjungan(id) ON DELETE CASCADE,
    dokter_user_id INT REFERENCES users(id),
    apoteker_user_id INT REFERENCES users(id),
    dari_user VARCHAR(120) NOT NULL,
    ke_user VARCHAR(120) NOT NULL DEFAULT 'Apoteker',
    isi_pesan TEXT NOT NULL,
    resep_item JSONB,
    status VARCHAR(30) NOT NULL DEFAULT 'menunggu', -- 'menunggu' | 'diproses' | 'siap_diambil' | 'diserahkan' | 'selesai'
    waktu TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_resep_kunjungan ON resep_obat(kunjungan_id);

-- 3. Diagnostic Examinations (Lab & Radiology)
CREATE TABLE IF NOT EXISTS pemeriksaan_penunjang (
    id SERIAL PRIMARY KEY,
    kunjungan_id INT NOT NULL REFERENCES kunjungan(id) ON DELETE CASCADE,
    tipe VARCHAR(20) NOT NULL DEFAULT 'lab', -- 'lab' | 'radiologi'
    jenis_pemeriksaan VARCHAR(120) NOT NULL,
    diminta_oleh_user_id INT REFERENCES users(id),
    diproses_oleh_user_id INT REFERENCES users(id),
    catatan_dokter TEXT,
    hasil_pemeriksaan TEXT,
    nilai_rujukan VARCHAR(120),
    status VARCHAR(30) NOT NULL DEFAULT 'menunggu', -- 'menunggu' | 'diproses' | 'hasil_siap'
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_penunjang_kunjungan ON pemeriksaan_penunjang(kunjungan_id);

-- 4. Archive Documents Detailed Tracking
CREATE TABLE IF NOT EXISTS arsip_dokumen (
    id SERIAL PRIMARY KEY,
    pasien_id INT NOT NULL REFERENCES pasien(id) ON DELETE CASCADE,
    no_rm VARCHAR(30) NOT NULL,
    nama_pasien VARCHAR(120) NOT NULL,
    gedung VARCHAR(60) NOT NULL DEFAULT 'Gedung Utama',
    lantai VARCHAR(40) NOT NULL,
    ruang VARCHAR(60) NOT NULL,
    area VARCHAR(60) NOT NULL DEFAULT 'Zona Arsip Medik',
    rak VARCHAR(40) NOT NULL,
    kolom VARCHAR(40) NOT NULL DEFAULT 'Kolom 1',
    baris VARCHAR(40) NOT NULL,
    box VARCHAR(40) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'tersedia',
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS arsip_tracking (
    id SERIAL PRIMARY KEY,
    arsip_id INT NOT NULL REFERENCES arsip_dokumen(id) ON DELETE CASCADE,
    from_location VARCHAR(120) NOT NULL,
    to_location VARCHAR(120) NOT NULL,
    requested_by_user_id INT REFERENCES users(id),
    processed_by_user_id INT REFERENCES users(id),
    status VARCHAR(30) NOT NULL,
    keterangan TEXT NOT NULL,
    waktu TIMESTAMP NOT NULL DEFAULT now()
);

-- 5. Notifications Table
CREATE TABLE IF NOT EXISTS notifikasi (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    role_kode VARCHAR(30),
    judul VARCHAR(120) NOT NULL,
    pesan TEXT NOT NULL,
    tipe VARCHAR(30) NOT NULL, -- 'resep' | 'lab' | 'arsip' | 'antrian' | 'sistem'
    tautan VARCHAR(120),
    dibaca BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notif_role ON notifikasi(role_kode);

-- 6. Add Admin Management Permission
INSERT INTO permissions (id, kode, modul, deskripsi) VALUES
(10, 'admin.kelola', 'admin', 'Mengelola pengguna, role, dan matriks hak akses permissions')
ON CONFLICT (id) DO NOTHING;

SELECT setval('permissions_id_seq', (SELECT MAX(id) FROM permissions));

INSERT INTO role_permissions (role_id, permission_id) VALUES
(5, 10)
ON CONFLICT DO NOTHING;

-- 7. Seed Initial Data for Archive Documents
INSERT INTO arsip_dokumen (id, pasien_id, no_rm, nama_pasien, gedung, lantai, ruang, area, rak, kolom, baris, box, status) VALUES
(1, 3, 'RM-2024-018472', 'Bilqis Nur Aisyah', 'Gedung Utama', 'Lantai 2', 'Ruang Arsip B', 'Zona Timur', 'Rak 5', 'Kolom 2', 'Baris 3', 'Kotak 12', 'tersedia'),
(2, 1, 'RM-2023-004120', 'Ahmad Fauzi', 'Gedung Utama', 'Lantai 2', 'Ruang Arsip A', 'Zona Barat', 'Rak 2', 'Kolom 1', 'Baris 1', 'Kotak 04', 'tersedia'),
(3, 2, 'RM-2022-009981', 'Siti Aminah', 'Gedung Utama', 'Lantai 2', 'Ruang Arsip A', 'Zona Barat', 'Rak 3', 'Kolom 2', 'Baris 2', 'Kotak 07', 'tersedia'),
(4, 4, 'RM-2021-002210', 'Rangga Saputra', 'Gedung Utama', 'Lantai 2', 'Ruang Arsip B', 'Zona Timur', 'Rak 4', 'Kolom 1', 'Baris 4', 'Kotak 09', 'tersedia')
ON CONFLICT (id) DO NOTHING;

SELECT setval('arsip_dokumen_id_seq', (SELECT MAX(id) FROM arsip_dokumen));

-- 8. Seed Initial Tracking for Bilqis
INSERT INTO arsip_tracking (arsip_id, from_location, to_location, requested_by_user_id, processed_by_user_id, status, keterangan, waktu) VALUES
(1, 'Rak 5 Kotak 12', 'Meja Sortir Lt.2', 2, 4, 'diminta', 'Perawat Poli Anak Lt.3 meminta berkas RM', now() - interval '35 minutes'),
(1, 'Meja Sortir Lt.2', 'Lift Pengiriman', 2, 4, 'dalam_pengiriman', 'Petugas arsip memindai berkas ke kurir Pak Dedi', now() - interval '20 minutes')
ON CONFLICT DO NOTHING;

-- 9. Seed Initial Prescriptions
INSERT INTO resep_obat (id, kunjungan_id, dokter_user_id, apoteker_user_id, dari_user, ke_user, isi_pesan, resep_item, status, waktu) VALUES
(1, 103, 1, 3, 'dr. Angga, Sp.A', 'Apt. Ratna Wijaya', 'Tolong siapkan resep untuk An. Bilqis ya.', '[{"nama_obat":"Parasetamol drops 100mg/mL","aturan_pakai":"Tiap 6 jam bila demam","jumlah":"1 botol"},{"nama_obat":"NaCl 0,9% nasal drops","aturan_pakai":"2 tetes/lubang hidung","jumlah":"1 botol"},{"nama_obat":"Zinc sirup 20mg/5mL","aturan_pakai":"1x sehari, 10 hari","jumlah":"1 botol"}]'::jsonb, 'terkirim', now() - interval '15 minutes')
ON CONFLICT (id) DO NOTHING;

SELECT setval('resep_obat_id_seq', (SELECT MAX(id) FROM resep_obat));

-- 10. Seed Initial Lab/Radiology Examinations
INSERT INTO pemeriksaan_penunjang (id, kunjungan_id, tipe, jenis_pemeriksaan, diminta_oleh_user_id, diproses_oleh_user_id, catatan_dokter, hasil_pemeriksaan, nilai_rujukan, status, created_at) VALUES
(1, 103, 'lab', 'Darah Rutin (Hb, Leukosit, Trombosit)', 1, 4, 'Evaluasi demam hari ke-3', 'Hb 12.1 g/dL, Leukosit 8.200 /uL, Trombosit 245.000 /uL', 'Hb: 11-14, Leu: 5.000-10.000', 'hasil_siap', now() - interval '1 hour'),
(2, 101, 'radiologi', 'Rontgen Toraks AP', 1, 4, 'Batuk pilek membandel', 'Cor dan pulmo dalam batas normal, tidak tampak infiltrat', 'Normal', 'diproses', now() - interval '30 minutes'),
(3, 102, 'lab', 'Urinalisis Lengkap', 1, 4, 'Skrining infeksi saluran kemih', NULL, 'Sedimen normal', 'menunggu', now() - interval '10 minutes')
ON CONFLICT (id) DO NOTHING;

SELECT setval('pemeriksaan_penunjang_id_seq', (SELECT MAX(id) FROM pemeriksaan_penunjang));

-- 11. Seed Initial Notifications
INSERT INTO notifikasi (role_kode, judul, pesan, tipe, tautan, dibaca) VALUES
('apoteker', 'Resep Baru Diterbitkan', 'dr. Angga, Sp.A menerbitkan resep untuk An. Bilqis Nur Aisyah (A03)', 'resep', '/resep?kunjungan_id=103', false),
('lab_radiologi', 'Permintaan Pemeriksaan Lab', 'Permintaan Urinalisis Lengkap untuk pasien Siti Aminah (A02)', 'lab', '/lab', false)
ON CONFLICT DO NOTHING;
