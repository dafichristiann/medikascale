-- Skema database MedikaScale
DROP TABLE IF EXISTS antropometri_pengukuran CASCADE;
DROP TABLE IF EXISTS wa_pesan_log CASCADE;
DROP TABLE IF EXISTS wa_sesi CASCADE;
DROP TABLE IF EXISTS antrian_log CASCADE;
DROP TABLE IF EXISTS kunjungan CASCADE;
DROP TABLE IF EXISTS layanan CASCADE;
DROP TABLE IF EXISTS pasien CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    kode VARCHAR(30) UNIQUE NOT NULL,
    nama_tampil VARCHAR(60) NOT NULL,
    is_system BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    kode VARCHAR(60) UNIQUE NOT NULL,
    modul VARCHAR(40) NOT NULL,
    deskripsi VARCHAR(160)
);

CREATE TABLE role_permissions (
    role_id INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    role_id INT NOT NULL REFERENCES roles(id),
    nama VARCHAR(120) NOT NULL,
    username VARCHAR(60) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    no_telepon VARCHAR(20),
    aktif BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE pasien (
    id SERIAL PRIMARY KEY,
    no_rm VARCHAR(30) UNIQUE NOT NULL,
    nama VARCHAR(120) NOT NULL,
    tanggal_lahir DATE NOT NULL,
    jenis_kelamin VARCHAR(20) NOT NULL,
    nama_wali VARCHAR(120),
    golongan_darah VARCHAR(5),
    no_telepon VARCHAR(20),
    alamat TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE layanan (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(80) NOT NULL,
    aktif BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE kunjungan (
    id SERIAL PRIMARY KEY,
    no_kunjungan VARCHAR(40) UNIQUE NOT NULL,
    pasien_id INT NOT NULL REFERENCES pasien(id),
    layanan_id INT NOT NULL REFERENCES layanan(id),
    dpjp_user_id INT REFERENCES users(id),
    perawat_user_id INT REFERENCES users(id),
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    poli VARCHAR(60),
    keluhan_utama TEXT,
    no_antrian VARCHAR(10) NOT NULL,
    status_antrian VARCHAR(10) NOT NULL DEFAULT 'putih',
    prioritas BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE (no_antrian, tanggal)
);

CREATE TABLE antrian_log (
    id SERIAL PRIMARY KEY,
    kunjungan_id INT NOT NULL REFERENCES kunjungan(id),
    status_dari VARCHAR(10),
    status_ke VARCHAR(10),
    diubah_oleh_user_id INT REFERENCES users(id),
    waktu TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE wa_sesi (
    id SERIAL PRIMARY KEY,
    no_telepon VARCHAR(20) NOT NULL,
    pasien_id INT REFERENCES pasien(id),
    layanan_id_sementara INT REFERENCES layanan(id),
    state VARCHAR(40) NOT NULL DEFAULT 'AWAL',
    konteks JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE wa_pesan_log (
    id SERIAL PRIMARY KEY,
    wa_sesi_id INT NOT NULL REFERENCES wa_sesi(id),
    kunjungan_id INT REFERENCES kunjungan(id),
    arah VARCHAR(6) NOT NULL,
    isi_pesan TEXT NOT NULL,
    status_kirim VARCHAR(15) NOT NULL DEFAULT 'terkirim',
    waktu TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE antropometri_pengukuran (
    id SERIAL PRIMARY KEY,
    kunjungan_id INT NOT NULL REFERENCES kunjungan(id),
    pasien_id INT NOT NULL REFERENCES pasien(id),
    diukur_oleh_user_id INT REFERENCES users(id),
    usia_bulan INT NOT NULL,
    berat_badan_kg NUMERIC(5,2) NOT NULL,
    tinggi_badan_cm NUMERIC(5,2) NOT NULL,
    lingkar_kepala_cm NUMERIC(5,2),
    z_score_bb_u NUMERIC(4,2),
    z_score_tb_u NUMERIC(4,2),
    z_score_bb_tb NUMERIC(4,2),
    z_score_lk_u NUMERIC(4,2),
    interpretasi VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT now()
);
