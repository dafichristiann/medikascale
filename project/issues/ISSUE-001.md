# ISSUE-001: Desain Tabel Arsip Rekam Medis Fisik

**Issue ID:** ISSUE-001  
**Epic:** EPIQUE-ORANGB  
**Status:** Open
**Closed:** 2026-09-18 (via TASK-002, migration live terverifikasi)
**Priority:** High  
**Assignee:** Orang B  
**Type:** Design  
**Estimated:** 4 hours  

---

## Description

Rancang dan buat 4 tabel database untuk modul Arsip Rekam Medis Fisik:

1. **`arsip_lokasi`** â€” Hierarki penyimpanan fisik (Lantai â†’ Ruang â†’ Rak â†’ Baris)
2. **`arsip_map`** â€” Data master map rekam medis
3. **`arsip_pinjam`** â€” Transaksi peminjaman
4. **`arsip_pinjam_detail`** â€” Detail dokumen yang dipinjam

## Requirements

### `arsip_lokasi`
- `[ ]` kolom: `lantai`, `ruang`, `rak`, `baris`, `keterangan`, `aktif`, `created_by_user_id`
- `[ ]` unique constraint pada `(lantai, ruang, rak, baris)`
- `[ ]` `aktif` BOOLEAN default TRUE
- `[ ]` `created_by_user_id` FK ke `users(id)`

### `arsip_map`
- `[ ]` kolom: `nomor_map` (UNIQUE), `nomor_dokumen`, `pasien_id`, `lokasi_id`, `status`, `keterangan`
- `[ ]` status CHECK: `tersedia`, `dipinjam`, `dikembalikan`
- `[ ]` FK ke `pasien(id)` dan `arsip_lokasi(id)`
- `[ ]` Index pada `pasien_id`, `nomor_map`, `nomor_dokumen`, `status`

### `arsip_pinjam`
- `[ ]` kolom: `map_id`, `peminjam_user_id`, `tanggal_pinjam`, `tanggal_kembali`, `status`, `keterangan` (NOT NULL)
- `[ ]` status CHECK: `dipinjam`, `dikembalikan`
- `[ ]` FK ke `arsip_map(id)` dan `users(id)`
- `[ ]` `keterangan` wajib diisi â€” menjelaskan dokumen yang dipinjam

### `arsip_pinjam_detail`
- `[ ]` kolom: `pinjam_id`, `nomor_dokumen`, `nama_dokumen`, `keterangan`
- `[ ]` FK ke `arsip_pinjam(id)`

## Acceptance Criteria

- [ ] Semua 4 tabel berhasil dibuat dengan `CREATE TABLE IF NOT EXISTS` (live: `Migration 002_orangb_init_schema completed`)
- [ ] Semua FK dan constraints berfungsi (migration lolos, FK ke 001 ter-resolve)
- [ ] Pencarian berdasarkan nomor map, nomor RM, nama pasien, dan lokasi dapat dilakukan (index + JOIN)
- [ ] Workflow status terdefinisi: peminjaman `tersedia` â†’ `dipinjam`, pengembalian â†’ `dikembalikan` + `tanggal_kembali` (dieksekusi service layer dalam transaksi, ikut pola `aantrianService`)
- [ ] Data transaksi tidak dihapus (history preserved, tanpa trigger/cascade delete)
- [ ] Konsisten dengan schema yang sudah ada (`BIGSERIAL`, `TIMESTAMPTZ`)

## Dependencies

- Tabel `users`, `pasien` harus sudah ada (migration 001)
- Tabel `arsip_lokasi` harus dibuat sebelum `arsip_map`

## Related Tasks

- TASK-002

## Notes

- Satu map dapat berisi beberapa dokumen â†’ perlukan `arsip_pinjam_detail`
- Nomor antrian pasien tetap dipertahankan meskipun urutan berubah
- Tidak menggunakan QR code / barcode
