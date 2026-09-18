# ISSUE-004: Pembuatan SQL Migration

**Issue ID:** ISSUE-004
**Epic:** EPIQUE-ORANGB
**Status:** Open
**Closed:** 2026-09-18 (via TASK-005, migration live terverifikasi)
**Priority:** High
**Assignee:** Orang B
**Type:** Implementation
**Estimated:** 2 hours

---

## Description

Buat file migration `002_orangb_init_schema.ts` yang berisi semua 14 tabel baru.

## Acceptance Criteria

- [ ] File `backend/src/db/orangb/002_orangb_schema.ts` ada
- [ ] Semua 14 tabel dengan `CREATE TABLE IF NOT EXISTS`
- [ ] Semua index dengan `CREATE INDEX IF NOT EXISTS`
- [ ] FK resolve ke tabel existing 001
- [ ] Idempotent (bisa dijalankan berulang kali)
- [ ] `npm run db:migrate:orangb` â†’ `Migration 002_orangb_init_schema completed`
- [ ] `npm run build` (backend) lolos

## Related Tasks

- TASK-005

## Notes

- Migration menggunakan array of migration objects dalam TypeScript
- Setiap migration memiliki `name` dan `up` (SQL string)
- Statement dipisahkan dengan `;`
- Comments menggunakan `--` di dalam SQL string
