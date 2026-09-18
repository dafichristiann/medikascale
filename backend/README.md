# MedikaScale — Backend (NestJS + TypeORM + PostgreSQL)

Backend REST API untuk sistem klinik & poliklinik anak MedikaScale. Dibangun dengan arsitektur modular NestJS, TypeORM, RBAC granular berbasis permissions, integrasi WhatsApp chatbot (state machine), kalkulasi z-score standar WHO LMS, serta endpoint stub untuk modul Arsip, Resep, dan Lab.

---

## 🚀 Fitur Utama

1. **Autentikasi & RBAC Granular (Modul Orang A)**
   - Login JWT via `POST /api/auth/login`.
   - Mengembalikan daftar `permissions` hasil query relasi `role_permissions` $\to$ `permissions` milik pengguna.
   - Pengecekan otorisasi menggunakan decorator `@RequirePermissions(...)` dan guard `PermissionsGuard` (menjaga endpoint berdasarkan kode permission, bukan nama role).

2. **Antrian Pasien & Audit Log (Modul Orang A)**
   - `GET /api/antrian?tanggal=YYYY-MM-DD`: Mengambil daftar kunjungan dengan relasi pasien dan layanan.
   - `PATCH /api/antrian/:id/status`: Memindahkan antrian antar kolom (putih $\to$ hijau $\to$ kuning $\to$ merah) sekaligus mencatat riwayat perubahan ke tabel `antrian_log`.
   - `PATCH /api/antrian/:id/prioritas`: Menandai antrian sebagai prioritas klinis tanpa mengubah nomor antrian yang sudah diterbitkan.

3. **Antropometri & Standar WHO LMS (Modul Orang A)**
   - `POST /api/antropometri`: Memasukkan data pengukuran balita (BB, TB, LK, usia bulan) dan otomatis menghitung z-score presisi standar WHO (BB/U, TB/U, BB/TB, LK/U) dengan interpolasi kurva LMS serta interpretasi klinis resmi.

4. **Chatbot WhatsApp & Gateway Adapter (Modul Orang A)**
   - `POST /api/wa/webhook`: Webhook pesan masuk dengan desain provider-agnostic (`{ from, message }`).
   - Lapisan adapter modular (`GenericWhatsAppAdapter` dan `FonnteWhatsAppAdapter`).
   - State machine otomatis di tabel `wa_sesi` dan `wa_pesan_log`:
     - Pendaftaran antrian via No. RM $\to$ verifikasi pasien $\to$ pemilihan layanan katalog $\to$ generate nomor antrian harian (looping A01–A99) & nomor kunjungan.
     - Cek status antrian terkini hari ini.
   - `POST /api/wa/simulate`: Simulator chat interaktif langsung dari Swagger UI atau Postman.
   - `GET /api/wa/history`: Riwayat pesan per nomor telepon.

5. **Dashboard & Layanan (Modul Orang A)**
   - `GET /api/layanan`: Katalog layanan aktif (SOAPIE, Vaksin, Konsul Tumbuh Kembang, dst).
   - `GET /api/dashboard/summary`: Agregasi ringkasan antrian, status, prioritas, dan persebaran layanan hari ini.

6. **Stubs Modul Orang B**
   - Arsip Rekam Medis: `GET /api/arsip/cari`, `GET /api/arsip/:pasienId/tracking`, `POST /api/arsip/:pasienId/minta-pengiriman`.
   - Pesan Resep: `GET /api/resep`, `POST /api/resep`, `PATCH /api/resep/:id/status`.
   - Lab & Radiologi: `GET /api/lab`, `PATCH /api/lab/:id/status`.

---

## 🛠️ Persyaratan & Instalasi

### 1. Database PostgreSQL
Pastikan service PostgreSQL berjalan di port 5432, buat database:
```sql
CREATE DATABASE medikascale;
```

Eksekusi skema dan seed data awal:
```bash
# Inisialisasi skema tabel
psql -U postgres -d medikascale -f init-schema.sql

# Inisialisasi seed data pengguna demo & antrian hari ini
psql -U postgres -d medikascale -f seed.sql
```

### 2. Konfigurasi Environment (`.env`)
Salin atau buat file `.env` di direktori `backend/`:
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=
DB_NAME=medikascale

JWT_SECRET=medikascale_jwt_secret_key_2026_super_secure
JWT_EXPIRES_IN=8h
```

### 3. Menjalankan Server
```bash
# Jalankan mode build dan start
npm run build
npm run start

# Atau mode development watch
npm run start:dev
```

- API Base URL: `http://localhost:3000/api`
- Swagger Documentation & WA Simulator: `http://localhost:3000/docs`

### 4. Akun Demo untuk Pengujian

| Username | Password | Role | Permissions Utama |
|---|---|---|---|
| `dokter` | `demo123` | Dokter | `antrian.view`, `antrian.ubah_status`, `resep.kirim`, `arsip.view` |
| `perawat` | `demo123` | Perawat | `antrian.view`, `antrian.prioritaskan`, `antrian.ubah_status`, `antropometri.input`, `arsip.view`, `arsip.minta_pengiriman` |
| `apoteker` | `demo123` | Apoteker | `resep.proses` |
| `lab` | `demo123` | Lab & Radiologi | `lab.kelola`, `arsip.view` |

### 5. Menjalankan Pengujian Otomatis (E2E)
```bash
node test-e2e.js
```
