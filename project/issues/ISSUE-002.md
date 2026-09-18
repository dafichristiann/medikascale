# ISSUE-002: Desain Tabel E-Resep

**Issue ID:** ISSUE-002
**Epic:** EPIQUE-ORANGB
**Status:** Open
**Closed:** 2026-09-18 (via TASK-003, migration live terverifikasi)
**Priority:** High
**Assignee:** Orang B
**Type:** Design
**Estimated:** 3 hours

---

## Description

Rancang 2 tabel untuk modul E-Resep: `resep`, `resep_item`.

## Requirements

### `resep`
- `[ ]` kolom: `nomor_resep` (UNIQUE), `kunjungan_id`, `pasien_id`, `dokter_id`, `status`, `catatan`
- `[ ]` status CHECK: `dibuat`, `dikirim`, `diproses`, `siap`, `selesai`, `dibatalkan`
- `[ ]` FK ke `kunjungan(id)`, `pasien(id)`, `users(id)`
- `[ ]` Index pada `pasien_id`, `dokter_id`, `status`, `nomor_resep`, `kunjungan_id`
- `[ ]` `nomor_resep` unik

### `resep_item`
- `[ ]` kolom: `resep_id`, `kode_obat`, `nama_obat`, `dosis`, `jumlah`, `frekuensi`, `aturan`, `instruksi`
- `[ ]` FK ke `resep(id)`
- `[ ]` Index pada `resep_id`

## Acceptance Criteria

- [ ] Semua 2 tabel berhasil dibuat dengan `CREATE TABLE IF NOT EXISTS`
- [ ] Semua FK dan constraints berfungsi
- [ ] Status flow dibuat â†’ dikirim â†’ diproses â†’ siap â†’ selesai â†’ dibatalkan
- [ ] Role access terdefinisi (dokter vs apoteker)
- [ ] Konsisten dengan schema yang sudah ada (`BIGSERIAL`, `TIMESTAMPTZ`)
- [ ] `npm run db:migrate:orangb` berjalan tanpa error

## Related Tasks

- TASK-003

## Notes

- Satu resep berisi beberapa item obat â†’ butuh `resep_item`
- Status flow mengikuti alur dokter â†’ apoteker
- Tidak menggunakan trigger DB untuk update status â€” ikuti pola service layer existing
