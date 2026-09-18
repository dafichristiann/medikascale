-- Migration 002: Modul Orang B (Arsip Rekam Medis, E-Resep, Laboratorium & Radiologi)

-- ============================================================================
-- 1. MODUL ARSIP REKAM MEDIS
-- ============================================================================

CREATE TABLE IF NOT EXISTS arsip_lokasi (
    id SERIAL PRIMARY KEY,
    lantai VARCHAR(50) NOT NULL,
    ruang VARCHAR(50) NOT NULL,
    rak VARCHAR(50) NOT NULL,
    baris VARCHAR(50) NOT NULL,
    keterangan TEXT,
    aktif BOOLEAN NOT NULL DEFAULT TRUE,
    created_by_user_id INT REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (lantai, ruang, rak, baris)
);

CREATE TABLE IF NOT EXISTS arsip_map (
    id SERIAL PRIMARY KEY,
    nomor_map VARCHAR(50) UNIQUE NOT NULL,
    nomor_dokumen VARCHAR(50),
    pasien_id INT NOT NULL REFERENCES pasien(id),
    lokasi_id INT REFERENCES arsip_lokasi(id),
    status VARCHAR(20) NOT NULL DEFAULT 'tersedia' CHECK (status IN ('tersedia', 'dipinjam', 'dikembalikan')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS arsip_pinjam (
    id SERIAL PRIMARY KEY,
    map_id INT NOT NULL REFERENCES arsip_map(id),
    peminjam_user_id INT NOT NULL REFERENCES users(id),
    tanggal_pinjam TIMESTAMPTZ NOT NULL DEFAULT now(),
    tanggal_kembali TIMESTAMPTZ,
    status VARCHAR(20) NOT NULL DEFAULT 'dipinjam' CHECK (status IN ('dipinjam', 'dikembalikan')),
    keterangan TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS arsip_pinjam_detail (
    id SERIAL PRIMARY KEY,
    pinjam_id INT NOT NULL REFERENCES arsip_pinjam(id) ON DELETE CASCADE,
    nomor_dokumen VARCHAR(50),
    nama_dokumen VARCHAR(120) NOT NULL,
    keterangan TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_arsip_lokasi ON arsip_lokasi(lantai, ruang, rak, baris);
CREATE INDEX IF NOT EXISTS idx_arsip_map_pasien ON arsip_map(pasien_id);
CREATE INDEX IF NOT EXISTS idx_arsip_map_lokasi ON arsip_map(lokasi_id);
CREATE INDEX IF NOT EXISTS idx_arsip_map_status ON arsip_map(status);
CREATE INDEX IF NOT EXISTS idx_arsip_pinjam_map ON arsip_pinjam(map_id);
CREATE INDEX IF NOT EXISTS idx_arsip_pinjam_user ON arsip_pinjam(peminjam_user_id);
CREATE INDEX IF NOT EXISTS idx_arsip_pinjam_status ON arsip_pinjam(status);

-- ============================================================================
-- 2. MODUL E-RESEP
-- ============================================================================

CREATE TABLE IF NOT EXISTS resep (
    id SERIAL PRIMARY KEY,
    nomor_resep VARCHAR(50) UNIQUE NOT NULL,
    kunjungan_id INT NOT NULL REFERENCES kunjungan(id),
    pasien_id INT NOT NULL REFERENCES pasien(id),
    dokter_id INT NOT NULL REFERENCES users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'dibuat' CHECK (status IN ('dibuat', 'dikirim', 'diproses', 'siap', 'selesai', 'dibatalkan')),
    catatan TEXT,
    tanggal_dikirim TIMESTAMPTZ,
    tanggal_diproses TIMESTAMPTZ,
    tanggal_selesai TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS resep_item (
    id SERIAL PRIMARY KEY,
    resep_id INT NOT NULL REFERENCES resep(id) ON DELETE CASCADE,
    kode_obat VARCHAR(50),
    nama_obat VARCHAR(120) NOT NULL,
    dosis VARCHAR(50),
    jumlah VARCHAR(50) NOT NULL,
    frekuensi VARCHAR(50),
    aturan VARCHAR(100),
    instruksi TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_resep_kunjungan ON resep(kunjungan_id);
CREATE INDEX IF NOT EXISTS idx_resep_pasien ON resep(pasien_id);
CREATE INDEX IF NOT EXISTS idx_resep_dokter ON resep(dokter_id);
CREATE INDEX IF NOT EXISTS idx_resep_status ON resep(status);
CREATE INDEX IF NOT EXISTS idx_resep_item_resep ON resep_item(resep_id);

-- ============================================================================
-- 3. MODUL LABORATORIUM & RADIOLOGI
-- ============================================================================

CREATE TABLE IF NOT EXISTS pemeriksaan (
    id SERIAL PRIMARY KEY,
    nomor_pemeriksaan VARCHAR(50) UNIQUE NOT NULL,
    jenis VARCHAR(20) NOT NULL CHECK (jenis IN ('laboratorium', 'radiologi')),
    kunjungan_id INT NOT NULL REFERENCES kunjungan(id),
    pasien_id INT NOT NULL REFERENCES pasien(id),
    dokter_id INT NOT NULL REFERENCES users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'diminta' CHECK (status IN ('diminta', 'diterima', 'dijadwalkan', 'diproses', 'selesai', 'dibatalkan')),
    catatan TEXT,
    tanggal_diperiksa TIMESTAMPTZ,
    tanggal_selesai TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pemeriksaan_item (
    id SERIAL PRIMARY KEY,
    pemeriksaan_id INT NOT NULL REFERENCES pemeriksaan(id) ON DELETE CASCADE,
    kode_item VARCHAR(50),
    nama_item VARCHAR(120) NOT NULL,
    satuan VARCHAR(30),
    nilai_referensi VARCHAR(100),
    catatan TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pemeriksaan_hasil (
    id SERIAL PRIMARY KEY,
    pemeriksaan_id INT NOT NULL REFERENCES pemeriksaan(id) ON DELETE CASCADE,
    pemeriksaan_item_id INT REFERENCES pemeriksaan_item(id),
    nilai VARCHAR(100),
    satuan VARCHAR(30),
    interpretasi TEXT,
    petugas_id INT REFERENCES users(id),
    dokter_tinjau_id INT REFERENCES users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'menunggu' CHECK (status IN ('menunggu', 'diproses', 'ditinjau')),
    tanggal_diperiksa TIMESTAMPTZ,
    tanggal_tinjau TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pemeriksaan_log (
    id SERIAL PRIMARY KEY,
    pemeriksaan_id INT NOT NULL REFERENCES pemeriksaan(id) ON DELETE CASCADE,
    status_lama VARCHAR(20),
    status_baru VARCHAR(20) NOT NULL,
    changed_by_user_id INT REFERENCES users(id),
    keterangan TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pemeriksaan_kunjungan ON pemeriksaan(kunjungan_id);
CREATE INDEX IF NOT EXISTS idx_pemeriksaan_pasien ON pemeriksaan(pasien_id);
CREATE INDEX IF NOT EXISTS idx_pemeriksaan_dokter ON pemeriksaan(dokter_id);
CREATE INDEX IF NOT EXISTS idx_pemeriksaan_jenis ON pemeriksaan(jenis);
CREATE INDEX IF NOT EXISTS idx_pemeriksaan_status ON pemeriksaan(status);
CREATE INDEX IF NOT EXISTS idx_pemeriksaan_item ON pemeriksaan_item(pemeriksaan_id);
CREATE INDEX IF NOT EXISTS idx_pemeriksaan_hasil_pemeriksaan ON pemeriksaan_hasil(pemeriksaan_id);
CREATE INDEX IF NOT EXISTS idx_pemeriksaan_hasil_petugas ON pemeriksaan_hasil(petugas_id);
CREATE INDEX IF NOT EXISTS idx_pemeriksaan_log_pemeriksaan ON pemeriksaan_log(pemeriksaan_id);
