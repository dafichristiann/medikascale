# ISSUE-007: Penambahan Permission Baru ke RBAC

**Issue ID:** ISSUE-007
**Epic:** EPIQUE-ORANGB
**Status:** Open
**Closed:** 2026-09-18 (via TASK-009, seed update)
**Priority:** High
**Assignee:** Orang B
**Type:** Implementation
**Estimated:** 1 jam

---

## Description

Tambahkan 12 permission baru dan 3 role baru ke sistem RBAC.

## Acceptance Criteria

- [ ] 12 permission baru ada di tabel `permissions`
- [ ] 3 role baru ada di tabel `roles`
- [ ] Role-permission mapping benar di `role_permissions`
- [ ] `npm run db:seed` berjalan tanpa error
- [ ] `seed.ts` menggunakan `ON CONFLICT DO NOTHING` / `ON CONFLICT DO UPDATE`

## Related Tasks

- TASK-009, TASK-015

## Notes

- New roles: `apoteker`, `petugas_lab`, `arsiparis`
- New permissions: 4 arsip + 6 resep + 4 pemeriksaan = 14 total (beberapa overlap dengan existing)
- Seed berjalan setelah 001 migration (permissions table sudah ada)
