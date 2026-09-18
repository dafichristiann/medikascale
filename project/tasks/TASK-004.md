# TASK-004: Desain Tabel Laboratorium & Radiologi

**Task ID:** TASK-004
**Epic:** EPIQUE-ORANGB
**Status:** Pending
**Priority:** High
**Assignee:** Orang B
**Type:** Design
**Estimated:** 4 hours
**Depends On:** TASK-001
**Blockers:** ISSUE-003
**Created:** 2026-09-18

---

## Description

Rancang 4 tabel untuk modul Laboratorium & Radiologi.

## Deliverables

- [ ] Desain `pemeriksaan` (master permintaan pemeriksaan)
- [ ] Desain `pemeriksaan_item` (detail item pemeriksaan)
- [ ] Desain `pemeriksaan_hasil` (hasil dan tinjauan dokter)
- [ ] Desain `pemeriksaan_log` (audit trail)
- [ ] SQL schema definition
- [ ] Status flow definition
- [ ] Role-based access mapping

## Status Flow

```
diminta â†’ diterima â†’ dijadwalkan â†’ diproses â†’ selesai
                                â†˜ dibatalkan
```

- **diminta** â€” Dokter mengirimkan permintaan
- **diterima** â€” Petugas lab/radiologi menerima permintaan
- **dijadwalkan** â€” Jadwal pemeriksaan ditetapkan
- **diproses** â€” Petugas melakukan pemeriksaan
- **selesai** â€” Hasil final, dokter meninjau
- **dibatalkan** â€” Permintaan dibatalkan

## Design

### `pemeriksaan`
- `nomor_pemeriksaan` VARCHAR(50) UNIQUE NOT NULL
- `jenis` VARCHAR(20) NOT NULL CHECK ('laboratorium', 'radiologi')
- `kunjungan_id` FK â†’ kunjungan(id), `pasien_id` FK â†’ pasien(id), `dokter_id` FK â†’ users(id)
- `status` VARCHAR(20) NOT NULL DEFAULT 'diminta'
- `catatan`, `tanggal_diperiksa`, `tanggal_selesai`
- Index: `pasien_id`, `dokter_id`, `jenis`, `status`, `nomor_pemeriksaan`

### `pemeriksaan_item`
- `pemeriksaan_id` FK â†’ pemeriksaan(id), `kode_item`, `nama_item`, `satuan`, `nilai_referensi`, `catatan`
- Index: `pemeriksaan_id`

### `pemeriksaan_hasil`
- `pemeriksaan_id` FK â†’ pemeriksaan(id), `pemeriksaan_item_id` FK â†’ pemeriksaan_item(id)
- `nilai`, `satuan`, `interpretasi`, `petugas_id` FK â†’ users(id), `dokter_tinjau_id` FK â†’ users(id)
- `tanggal_diperiksa`, `tanggal_tinjau`
- Status flow internal: `menunggu` â†’ `diproses` â†’ `ditinjau`
- Index: `pemeriksaan_id`, `pemeriksaan_item_id`, `petugas_id`, `dokter_tinjau_id`

### `pemeriksaan_log`
- `pemeriksaan_id` FK â†’ pemeriksaan(id), `status_lama`, `status_baru`, `changed_by_user_id` FK â†’ users(id)
- `keterangan`, `created_at`
- Index: `pemeriksaan_id`, `changed_by_user_id`

## Acceptance Criteria

- [ ] Desain selesai dan terdokumentasi
- [ ] Status flow terdefinisi
- [ ] Role access terdefinisi (dokter order/review, petugas_lab process)
- [ ] Kompatibel dengan schema existing
- [ ] FK ke `kunjungan`, `pasien`, `users` valid
- [ ] Audit trail lengkap via `pemeriksaan_log`

## Output

- `docs/superpowers/specs/2026-09-18-orangb-module-design.md` â€” Section 5
- `project/issues/ISSUE-003.md` â€” Issue tracking
- `backend/src/db/orangb/002_orangb_schema.ts` â€” SQL migration (merged)

## Implementation (Terverifikasi 2026-09-18)

- `npm run db:migrate:orangb` â†’ `Migration 002_orangb_init_schema completed` âœ…
- Semua FK resolve ke tabel 001 âœ…
- `pemeriksaan` (10 kolom), `pemeriksaan_item` (7 kolom), `pemeriksaan_hasil` (10 kolom), `pemeriksaan_log` (6 kolom) âœ…

## Next Steps

- TASK-005: SQL Migration final + seed
