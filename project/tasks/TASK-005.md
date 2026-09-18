# TASK-005: Buat SQL Migration Final & Seed

**Task ID:** TASK-005
**Epic:** EPIQUE-ORANGB
**Status:** Completed
**Priority:** High
**Assignee:** Orang B
**Type:** Implementation
**Estimated:** 2 hours
**Depends On:** TASK-003, TASK-004
**Blockers:** ISSUE-004
**Created:** 2026-09-18

---

## Description

Gabungkan semua desain (Arsip, E-Resep, Lab/Radiologi) ke dalam satu migration final `002_orangb_init_schema.ts`. Buat seed placeholder.

## Deliverables

- [ ] `backend/src/db/orangb/002_orangb_schema.ts` â€” semua 14 tabel + indexes
- [ ] `backend/src/db/orangb/seed.ts` â€” seed placeholder
- [ ] `backend/package.json` â€” script `db:migrate:orangb`, `db:seed:orangb`
- [ ] `backend/src/server.ts` â€” runOrangBMigrations() after core migrations

## Current Status

Migration sudah ada di `002_orangb_schema.ts` dengan 14 tabel:
- `arsip_lokasi`, `arsip_map`, `arsip_pinjam`, `arsip_pinjam_detail`
- `resep`, `resep_item`
- `pemeriksaan`, `pemeriksaan_item`, `pemeriksaan_hasil`, `pemeriksaan_log`

## Verification

- `npm run db:migrate:orangb` â†’ `Migration 002_orangb_init_schema completed` âœ…
- `npm run build` (backend) â†’ tsc compile ok âœ…

## Acceptance Criteria

- [ ] Semua tabel menggunakan `CREATE TABLE IF NOT EXISTS` (idempotent)
- [ ] Semua FK resolve ke tabel yang sudah ada di 001
- [ ] Tidak ada duplikasi data pasien/kunjungan
- [ ] `npm run db:migrate:orangb` berjalan tanpa error
- [ ] `npm run build` lolos

## Output

- `backend/src/db/orangb/002_orangb_schema.ts`
- `backend/src/db/orangb/seed.ts`
- `backend/package.json`
- `backend/src/server.ts`

## Next Steps

- TASK-006: ERD + data flow docs
- TASK-007: RBAC permissions seed
