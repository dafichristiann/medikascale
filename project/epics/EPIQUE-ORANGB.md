# Epic: Modul Orang B â€” Arsip Rekam Medis, E-Resep, Laboratorium & Radiologi

**Epic ID:** EPIQUE-ORANGB  
**Status:** Todo  
**Priority:** High  
**Assignee:** Orang B  
**Start Date:** 2026-09-18  
**Target Date:** 2026-09-25  
**Sprint:** Sprint 1  
**Project:** MedikaScale  

---

## Description

Merancang dan mengimplementasikan database serta fitur untuk tiga modul Orang B:
1. **Arsip Rekam Medis Fisik** â€” Pengelolaan lokasi fisik, peminjaman, dan pengembalian dokumen medis
2. **E-Resep Dokter ke Apoteker** â€” Sistem resep elektronik dengan manajemen status
3. **Laboratorium & Radiologi** â€” Pengelolaan permintaan dan hasil pemeriksaan

---

## Acceptance Criteria

### Arsip Rekam Medis Fisik
- [ ] Tabel `arsip_lokasi` dibuat dengan hierarki Lantai â†’ Ruang â†’ Rak â†’ Baris
- [ ] Tabel `arsip_map` dibuat dengan status `tersedia`, `dipinjam`, `dikembalikan`
- [ ] Tabel `arsip_pinjam` dibuat dengan mandatory kolom `keterangan`
- [ ] Tabel `arsip_pinjam_detail` dibuat untuk detail dokumen
- [ ] Pencarian berdasarkan nomor map, nomor rekam medis, nama pasien, dan lokasi berfungsi
- [ ] Transaksi peminjaman dan pengembalian tercatat tanpa menghapus data lama
- [ ] Status map diperbarui otomatis saat peminjaman/pengembalian

### E-Resep
- [ ] Tabel `resep` dibuat dengan status `dibuat`, `dikirim`, `diproses`, `siap`, `selesai`, `dibatalkan`
- [ ] Tabel `resep_item` dibuat untuk item obat
- [ ] Resep terhubung ke `kunjungan`, `pasien`, dan `users` (dokter)
- [ ] Nomor resep unik (`nomor_resep`)
- [ ] Status flow berjalan sesuai alur dokter â†’ apoteker

### Laboratorium & Radiologi
- [ ] Tabel `pemeriksaan` dibuat dengan jenis `laboratorium` dan `radiologi`
- [ ] Tabel `pemeriksaan_item` dibuat untuk detail item pemeriksaan
- [ ] Tabel `pemeriksaan_hasil` dibuat untuk hasil dan tinjauan dokter
- [ ] Tabel `pemeriksaan_log` dibuat untuk audit trail
- [ ] Status flow: `diminta` â†’ `diterima` â†’ `dijadwalkan` â†’ `diproses` â†’ `selesai`

### Teknis
- [ ] Semua tabel menggunakan `BIGSERIAL` PK
- [ ] Semua timestamp menggunakan `TIMESTAMPTZ`
- [ ] Foreign key ke tabel existing (`pasien`, `kunjungan`, `users`)
- [ ] Index strategis untuk performa query
- [ ] Migration dapat dijalankan setelah `001_init_schema`
- [ ] Tidak ada duplikasi data pasien atau kunjungan

---

## Dependencies

- Migration `001_init_schema` harus sudah dijalankan terlebih dahulu
- Tabel `users`, `pasien`, `kunjungan`, `layanan` harus sudah ada
- Sistem RBAC (roles, permissions) harus sudah tersedia

---

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Tabel `layanan` belum ada di migrate.ts | Blocking | Buat migration tambahan untuk `layanan` |
| `BIGSERIAL` vs `SERIAL` inconsistency | Medium | Konsisten gunakan `BIGSERIAL` untuk semua tabel baru |
| Tabel permissions/role_permissions belum ada | Medium | Tambahkan ke migration `001` atau buat `001b` |

---

## Related Issues

- ISSUE-001: Desain tabel arsip rekam medis
- ISSUE-002: Desain tabel e-resep
- ISSUE-003: Desain tabel laboratorium & radiologi
- ISSUE-004: Pembuatan SQL migration
- ISSUE-005: Pembuatan ERD visual
- ISSUE-006: Contoh alur data
- ISSUE-007: Penambahan permission baru ke RBAC

---

## Tasks

| Task ID | Description | Status | Assignee |
|---------|-------------|--------|----------|
| TASK-001 | Analisis kompatibilitas schema existing | Pending | Orang B |
| TASK-002 | Desain tabel arsip rekam medis (4 tables) | Pending | Orang B |
| TASK-003 | Desain tabel e-resep (2 tables) | Pending | Orang B |
| TASK-004 | Desain tabel laboratorium & radiologi (4 tables) | Pending | Orang B |
| TASK-005 | Buat SQL migration `002_orangb_init_schema.ts` | Pending | Orang B |
| TASK-006 | Buat ERD visual & contoh alur data | Pending | Orang B |
| TASK-007 | Tambahkan permission baru ke RBAC seed | Pending | Orang B |
| TASK-008 | Ekspansi Sidebar Frontend â€” 5 modul baru | Pending | Orang B |
| TASK-009 | Tambahkan permission baru ke RBAC | Pending | Orang B |
| TASK-010 | Frontend Halaman Lab/Radiologi & Arsip | Pending | Orang B |
| TASK-011 | Frontend Halaman E-Resep | Pending | Orang B |
| TASK-012 | API Routes â€” E-Resep | Pending | Orang B |
| TASK-013 | API Routes â€” Lab/Radiologi | Pending | Orang B |
| TASK-014 | WebSocket Events â€” Orang B Modules | Pending | Orang B |
| TASK-015 | Seed Role & Demo Users Baru | Pending | Orang B |
| TASK-016 | E2E Integration Tests | Pending | Orang B |
| TASK-017 | API Routes â€” Arsip | Pending | Orang B |
| TASK-018 | Build Verification & Deploy Check | Pending | Orang B |

---

## Notes

- Seluruh desain mengikuti gaya penamaan dan konvensi schema yang sudah ada
- Data transaksi tidak dihapus secara permanen (soft delete / audit trail)
- Status menggunakan nilai yang konsisten dengan `CHECK` constraints
- Migration harus idempotent (`CREATE TABLE IF NOT EXISTS`)
