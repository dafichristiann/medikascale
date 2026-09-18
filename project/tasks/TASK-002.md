# TASK-002: Desain Tabel Arsip Rekam Medis

**Task ID:** TASK-002
**Epic:** EPIQUE-ORANGB
**Status:** Pending
**Priority:** High
**Assignee:** Orang B
**Type:** Design
**Estimated:** 4 hours
**Depends On:** TASK-001
**Blockers:** ISSUE-001
**Completed:** 2026-09-18

---

## Description

Rancang 4 tabel untuk modul Arsip Rekam Medis Fisik sesuai spesifikasi.

## Deliverables

- [ ] Desain `arsip_lokasi` (lokasi fisik arsip)
- [ ] Desain `arsip_map` (master map rekam medis)
- [ ] Desain `arsip_pinjam` (transaksi peminjaman)
- [ ] Desain `arsip_pinjam_detail` (detail dokumen pinjaman)
- [ ] SQL schema definition
- [ ] Index strategy
- [ ] Constraint definitions

## Hasil Verifikasi

### `arsip_lokasi`
- Kolom `lantai`, `ruang`, `rak`, `baris` NOT NULL â€” hierarki Lantai â†’ Ruang â†’ Rak â†’ Baris âœ…
- `UNIQUE(lantai, ruang, rak, baris)` â€” satu slot fisik tidak bisa diduplikasi âœ…
- `aktif BOOLEAN DEFAULT TRUE` â€” soft toggle lokasi âœ…
- `created_by_user_id BIGINT REFERENCES users(id)` âœ…
- `BIGSERIAL` PK + `TIMESTAMPTZ` âœ…

### `arsip_map`
- `nomor_map VARCHAR(50) UNIQUE NOT NULL` â€” identitas master map âœ…
- `nomor_dokumen`, `pasien_id â†’ pasien(id)`, `lokasi_id â†’ arsip_lokasi(id)` âœ…
- `status CHECK (tersedia, dipinjam, dikembalikan)`, default `tersedia` âœ…
- Index: `pasien_id`, `nomor_map`, `nomor_dokumen`, `lokasi_id`, `status` âœ…

### `arsip_pinjam`
- `map_id NOT NULL â†’ arsip_map(id)`, `peminjam_user_id â†’ users(id)` âœ…
- `tanggal_pinjam` default now, `tanggal_kembali` NULL sampai dikembalikan âœ…
- `status CHECK (dipinjam, dikembalikan)` âœ…
- `keterangan TEXT NOT NULL` â€” wajib menjelaskan dokumen/bagian data yang dipinjam âœ…
- Index: `map_id`, `peminjam_user_id`, `status` âœ…

### `arsip_pinjam_detail`
- `pinjam_id NOT NULL â†’ arsip_pinjam(id)` âœ…
- `nomor_dokumen`, `nama_dokumen`, `keterangan` â€” granularitas per dokumen dalam satu map âœ…
- Index: `pinjam_id` âœ…

### Validasi Live
- âœ… `npm run db:migrate:orangb` â€” `Migration 002_orangb_init_schema completed` tanpa error (FK ke `users`/`pasien` dari 001 ter-resolve, urutan CREATE dalam file benar: lokasi â†’ map â†’ pinjam â†’ detail)

## Keputusan Desain

**Status map diupdate oleh application service layer, bukan trigger DB.** Alasan: mengikuti pola existing `aantrianService.updateKunjunganStatus` (UPDATE status + INSERT log dalam satu transaksi). Nanti service arsip akan melakukan `INSERT arsip_pinjam` + `UPDATE arsip_map.status` dalam satu transaksi, dan saat pengembalian `UPDATE arsip_pinjam (status, tanggal_kembali)` + `UPDATE arsip_map.status` dalam satu transaksi. Riwayat tidak pernah di-DELETE.

## Acceptance Criteria

- [ ] Desain selesai dan terdokumentasi
- [ ] Seluruh field, FK, constraint, index terdefinisi
- [ ] Kompatibel dengan schema existing
- [ ] Pencarian multi-dimensi didukung (nomor map via UNIQUE+index, nomor RM/nama via JOIN pasien + index pasien_id, lokasi via JOIN lokasi + index lokasi_id)
- [ ] Workflow peminjaman/pengembalian terdefinisi

## Output

- `docs/superpowers/specs/2026-09-18-orangb-module-design.md` â€” Section 3
- `backend/src/db/orangb/002_orangb_schema.ts` â€” SQL migration (tervalidasi live)
- `project/issues/ISSUE-001.md` â€” Closed

## Next Steps

- TASK-003: Desain tabel e-resep
