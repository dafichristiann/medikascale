# TASK-003: Desain Tabel E-Resep

**Task ID:** TASK-003
**Epic:** EPIQUE-ORANGB
**Status:** Pending
**Priority:** High
**Assignee:** Orang B
**Type:** Design
**Estimated:** 3 hours
**Depends On:** TASK-001
**Blockers:** ISSUE-002
**Completed:** 2026-09-18

---

## Description

Rancang 2 tabel untuk modul E-Resep Dokter ke Apoteker.

## Deliverables

- [ ] Desain `resep` (master prescription)
- [ ] Desain `resep_item` (medicine items)
- [ ] SQL schema definition
- [ ] Status flow definition
- [ ] Role-based access mapping

## Design

### `resep`
- `nomor_resep` VARCHAR(50) UNIQUE NOT NULL
- `kunjungan_id` FK â†’ kunjungan(id), `pasien_id` FK â†’ pasien(id), `dokter_id` FK â†’ users(id)
- `status` VARCHAR(20) NOT NULL DEFAULT 'dibuat' CHECK: `dibuat`, `dikirim`, `diproses`, `siap`, `selesai`, `dibatalkan`
- `catatan`, `tanggal_dikirim`, `tanggal_diproses`, `tanggal_selesai`
- `created_at`, `updated_at` TIMESTAMPTZ
- Index: `pasien_id`, `dokter_id`, `status`, `nomor_resep`, `kunjungan_id`

### `resep_item`
- `resep_id` FK â†’ resep(id), `kode_obat`, `nama_obat`, `dosis`, `jumlah`, `frekuensi`, `aturan`, `instruksi`
- Index: `resep_id`

## Status Flow

```
dibuat â†’ dikirim â†’ diproses â†’ siap â†’ selesai
                                  â†˜ dibatalkan
```

- **dibuat** â€” Dokter membuat resep
- **dikirim** â€” Dokter mengirim ke apoteker
- **diproses** â€” Apoteker memulai proses
- **siap** â€” Resep siap diambil
- **selesai** â€” Final, tidak bisa diubah
- **dibatalkan** â€” Dicatat, tidak dihapus

## Role Access

| Action | Role | Permission |
|--------|------|------------|
| Buat resep | dokter | `resep.create` |
| Kirim resep | dokter | `resep.send` |
| Proses resep | apoteker | `resep.process` |
| Selesaikan resep | apoteker | `resep.complete` |
| Batalkan resep | apoteker/dokter | `resep.cancel` |
| Lihat resep | semua terkait | `resep.view` |

## Acceptance Criteria

- [ ] Desain selesai dan terdokumentasi
- [ ] Status flow `dibuat â†’ dikirim â†’ diproses â†’ siap â†’ selesai â†’ dibatalkan` terdefinisi
- [ ] Role access terdefinisi (dokter vs apoteker)
- [ ] Kompatibel dengan schema existing
- [ ] FK ke `kunjungan`, `pasien`, `users` valid
- [ ] `nomor_resep` UNIQUE
- [ ] `npm run db:migrate:orangb` berjalan tanpa error (live verified)

## Hasil Verifikasi Live

- âœ… `npm run db:migrate:orangb` â†’ `Migration 002_orangb_init_schema completed`
- âœ… Semua FK resolve ke tabel 001
- âœ… `resep` (11 kolom), `resep_item` (8 kolom) â€” status CHECK valid
- âœ… Index: `kunjungan_id`, `pasien_id`, `dokter_id`, `status`, `nomor_resep`, `resep_id`

## Keputusan Desain

**Status map diupdate oleh application service layer, bukan trigger DB.** Mengikuti pola existing `aantrianService.updateKunjunganStatus` (UPDATE status + INSERT log dalam satu transaksi).

## Output

- `docs/superpowers/specs/2026-09-18-orangb-module-design.md` â€” Section 4
- `backend/src/db/orangb/002_orangb_schema.ts` â€” SQL migration (live verified)
- `project/issues/ISSUE-002.md` â€” Closed via TASK-003

## Next Steps

- TASK-004: Lab/Radiologi DB design
- TASK-012: API E-Resep routes [ME]
- TASK-011: Frontend E-Resep pages [ME]
