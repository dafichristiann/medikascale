# TASK-001: Analisis Kompatibilitas Schema Existing

**Task ID:** TASK-001
**Epic:** EPIQUE-ORANGB
**Status:** Pending
**Priority:** High
**Assignee:** Orang B
**Type:** Analysis
**Estimated:** 2 hours
**Completed:** 2026-09-18

---

## Description

Analisis tabel-tabel yang sudah ada dan pastikan kompatibilitas untuk desain Orang B.

## Findings (Terverifikasi 2026-09-18)

### Tabel yang Sudah Ada (migration `001_init_schema`)
- âœ… `roles` â€” id BIGSERIAL, name, description
- âœ… `permissions` â€” id BIGSERIAL, name, description, created_at TIMESTAMPTZ
- âœ… `role_permissions` â€” id, role_id BIGINT â†’ roles(id), permission_id BIGINT â†’ permissions(id), UNIQUE(role_id, permission_id)
- âœ… `users` â€” id BIGSERIAL, username, password_hash, role_id BIGINT â†’ roles(id), permissions TEXT[], created_at TIMESTAMPTZ
- âœ… `permission_audit_log` â€” id, role_id, permission_id, action CHECK(added/removed), changed_by_user_id â†’ users(id)
- âœ… `layanan` â€” id BIGSERIAL, nama, aktif, created_at/updated_at TIMESTAMPTZ
- âœ… `pasien` â€” id BIGSERIAL, no_rm UNIQUE, nama, tanggal_lahir, jenis_kelamin, nama_wali, golongan_darah, no_telepon, alamat
- âœ… `kunjungan` â€” id BIGSERIAL, pasien_id BIGINT â†’ pasien(id), layanan_id BIGINT â†’ layanan(id), dokter_id/perawat_id BIGINT â†’ users(id), keluhan_utama, status_antrian, prioritas
- âœ… `antrian_log` â€” id, kunjungan_id BIGINT â†’ kunjungan(id), status_lama/baru, changed_by â†’ users(id)
- âœ… `antropometri` â€” id, kunjungan_id BIGINT â†’ kunjungan(id), tinggi/berat/lingkar_kepala, umur_bulan, catatan, created_by_user_id â†’ users(id)

### Konsistensi Tipe Data (Terverifikasi)
- âœ… Semua PK: `BIGSERIAL` (001 dan 002 konsisten)
- âœ… Semua timestamp: `TIMESTAMPTZ` (001 dan 002 konsisten)
- âœ… Semua FK ke tabel inti: `BIGINT` â€” cocok dengan `BIGSERIAL` parent
- âœ… `TEXT[]` untuk `users.permissions` â€” tidak berubah
- âœ… Service layer (`parseInt` â†’ number â†’ pg driver) kompatibel dengan kolom `BIGINT`

### Kompatibilitas FK Orang B â†’ Tabel Existing (Terverifikasi)
| Tabel Orang B | FK | Target di 001 | Status |
|---|---|---|---|
| `arsip_lokasi` | created_by_user_id | users(id) | âœ… |
| `arsip_map` | pasien_id | pasien(id) | âœ… |
| `arsip_map` | lokasi_id | arsip_lokasi(id) | âœ… (dibuat sebelumnya dalam file yang sama) |
| `arsip_pinjam` | map_id | arsip_map(id) | âœ… |
| `arsip_pinjam` | peminjam_user_id | users(id) | âœ… |
| `arsip_pinjam_detail` | pinjam_id | arsip_pinjam(id) | âœ… |
| `resep` | kunjungan_id | kunjungan(id) | âœ… |
| `resep` | pasien_id | pasien(id) | âœ… |
| `resep` | dokter_id | users(id) | âœ… |
| `resep_item` | resep_id | resep(id) | âœ… |
| `pemeriksaan` | kunjungan_id/pasien_id/dokter_id | kunjungan/pasien/users | âœ… |
| `pemeriksaan_item` | pemeriksaan_id | pemeriksaan(id) | âœ… |
| `pemeriksaan_hasil` | pemeriksaan_id, pemeriksaan_item_id, petugas_id, dokter_tinjau_id | pemeriksaan/pemeriksaan_item/users | âœ… |
| `pemeriksaan_log` | pemeriksaan_id, changed_by_user_id | pemeriksaan/users | âœ… |

### Kompatibilitas Seed Data (Terverifikasi)
- âœ… `seed.ts` (001) INSERT ke `pasien`/`kunjungan` tanpa kolom baru yang nullable â†’ tetap jalan, tidak pecah
- âœ… `roles`/`users` seed tidak menyentuh tabel Orang B â†’ aman
- âœ… `orangb/seed.ts` placeholder, tidak butuh data statis â†’ aman

### Urutan Migration (Terverifikasi)
- âœ… `server.ts` menjalankan `runMigrations()` (001) lalu `runOrangBMigrations()` (002) secara berurutan
- âœ… Semua statement 002 memakai `CREATE TABLE IF NOT EXISTS` / `CREATE INDEX IF NOT EXISTS` â†’ idempotent
- âœ… Script `db:migrate:orangb` ditambahkan agar 002 bisa dijalankan mandiri setelah 001

## Bug Ditemukan & Diperbaiki Saat Task Ini
1. `backend/src/db/orangb/seed.ts` â€” `import pool from './pool.js'` (salah, file tidak ada) â†’ diperbaiki ke `'../pool.js'`
2. `backend/src/db/orangb/seed.ts` â€” komentar gaya SQL (`-- ...`) di dalam file TypeScript (syntax error) â†’ diperbaiki ke komentar `//`
3. `backend/src/db/orangb/seed.ts` â€” variabel `today` tidak terpakai â†’ dihapus
4. `backend/package.json` â€” tidak ada script untuk migration/seed Orang B â†’ ditambahkan `db:migrate:orangb` dan `db:seed:orangb`

## Verifikasi
- âœ… `npm run build` (backend) â€” lolos tanpa error TypeScript setelah perbaikan

## Recommendation

Keputusan konsistensi sudah diterapkan (bukan ditunda): seluruh schema 001 memakai `BIGSERIAL`/`TIMESTAMPTZ`/`BIGINT`, selaras dengan schema 002 Orang B. Tidak ada migrasi terpisah yang tertunda untuk tipe data.

Sisa catatan: tabel `antropometri_pengukuran` (dengan kolom z-score), `wa_sesi`, dan `wa_pesan_log` yang disebut di dokumen konteks belum ada di `migrate.ts` â€” modul Orang A tersebut di luar scope Orang B dan tidak menghambat FK Orang B. Jika Orang A menambahkannya nanti, tidak ada konflik nama dengan tabel Orang B.

## Output

- `docs/superpowers/specs/2026-09-18-orangb-module-design.md` â€” Section 2
- `project/issues/ISSUE-001.md` â€” Dependency analysis
- Perbaikan: `backend/src/db/orangb/seed.ts`, `backend/package.json`

## Next Steps

- TASK-002: Mulai desain tabel arsip
