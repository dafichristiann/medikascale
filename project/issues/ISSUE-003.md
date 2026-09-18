# ISSUE-003: Desain Tabel Laboratorium & Radiologi

**Issue ID:** ISSUE-003
**Epic:** EPIQUE-ORANGB
**Status:** Open
**Closed:** 2026-09-18 (via TASK-004, migration live terverifikasi)
**Priority:** High
**Assignee:** Orang B
**Type:** Design
**Estimated:** 4 hours

---

## Description

Rancang dan buat 4 tabel database untuk modul Laboratorium & Radiologi.

## Requirements

### `pemeriksaan`
- `[ ]` kolom: `nomor_pemeriksaan` (UNIQUE), `jenis`, `kunjungan_id`, `pasien_id`, `dokter_id`, `status`, `catatan`, `tanggal_*`
- `[ ]` status CHECK: `diminta`, `diterima`, `dijadwalkan`, `diproses`, `selesai`, `dibatalkan`
- `[ ]` FK ke `kunjungan(id)`, `pasien(id)`, `users(id)`
- `[ ]` Index pada `pasien_id`, `dokter_id`, `jenis`, `status`, `nomor_pemeriksaan`

### `pemeriksaan_item`
- `[ ]` kolom: `pemeriksaan_id`, `kode_item`, `nama_item`, `satuan`, `nilai_referensi`, `catatan`
- `[ ]` FK ke `pemeriksaan(id)`
- `[ ]` Index pada `pemeriksaan_id`

### `pemeriksaan_hasil`
- `[ ]` kolom: `pemeriksaan_id`, `pemeriksaan_item_id`, `nilai`, `satuan`, `interpretasi`, `petugas_id`, `dokter_tinjau_id`, `tanggal_*`
- `[ ]` FK ke `pemeriksaan(id)`, `pemeriksaan_item(id)`, `users(id)` x2
- `[ ]` Internal status flow: `menunggu` â†’ `diproses` â†’ `ditinjau`
- `[ ]` Index pada `pemeriksaan_id`, `pemeriksaan_item_id`, `petugas_id`, `dokter_tinjau_id`

### `pemeriksaan_log`
- `[ ]` kolom: `pemeriksaan_id`, `status_lama`, `status_baru`, `changed_by_user_id`, `keterangan`, `created_at`
- `[ ]` FK ke `pemeriksaan(id)`, `users(id)`
- `[ ]` Index pada `pemeriksaan_id`, `changed_by_user_id`

## Acceptance Criteria

- [ ] Semua 4 tabel berhasil dibuat dengan `CREATE TABLE IF NOT EXISTS`
- [ ] Semua FK dan constraints berfungsi
- [ ] Status flow: `diminta` â†’ `diterima` â†’ `dijadwalkan` â†’ `diproses` â†’ `selesai` â†’ `dibatalkan`
- [ ] Role access terdefinisi (dokter order/review, petugas_lab process)
- [ ] Audit trail lengkap via `pemeriksaan_log`
- [ ] Konsisten dengan schema yang sudah ada
- [ ] `npm run db:migrate:orangb` berjalan tanpa error

## Related Tasks

- TASK-004

## Notes

- Jenis pemeriksaan: `laboratorium` dan `radiologi`
- Hasil memerlukan tinjauan dokter sebelum final
- Data hasil tidak dihapus (history preserved)
