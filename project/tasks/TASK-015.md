# TASK-015: Seed Role & Demo Users Baru

**Task ID:** TASK-015
**Epic:** EPIQUE-ORANGB
**Status:** Completed
**Priority:** High
**Assignee:** Orang B (ME)
**Type:** Backend
**Estimated:** 1 jam
**Depends On:** TASK-009
**Blockers:** ISSUE-007
**Created:** 2026-09-18

---

## Description

Update `backend/src/db/seed.ts` dengan 3 role baru dan demo users.

## New Roles

- `apoteker` â€” password: `apoteker123`
- `petugas_lab` â€” password: `lab123`
- `arsiparis` â€” password: `arsip123`

## New Users

```sql
INSERT INTO users (username, password_hash, role_id, permissions) VALUES
('apoteker1', HASH('apoteker123'), apoteker_role_id, ARRAY['resep.view','resep.process','resep.complete','resep.cancel']),
('petugas_lab1', HASH('lab123'), petugas_lab_role_id, ARRAY['pemeriksaan.view','pemeriksaan.process','pemeriksaan.create']),
('arsiparis1', HASH('arsip123'), arsiparis_role_id, ARRAY['arsip.view','arsip.manage','arsip.pinjam','arsip.kembalikan'])
ON CONFLICT (username) DO UPDATE SET ...;
```

## Role-Permission Updates

- `dokter` role: tambahkan `resep.create`, `resep.send`, `pemeriksaan.create`, `pemeriksaan.review`, `arsip.pinjam`
- `perawat` role: tambahkan `arsip.pinjam` (opsional)

## Files to Modify

- `backend/src/db/seed.ts` â€” Tambah INSERT untuk roles, permissions, role_permissions, users baru

## Acceptance Criteria

- [ ] 3 role baru ada di tabel `roles`
- [ ] 12 permission baru ada di tabel `permissions`
- [ ] Demo users ada dengan password default
- [ ] `npm run db:seed` berjalan tanpa error
- [ ] `seed.ts` menggunakan `ON CONFLICT DO NOTHING` / `ON CONFLICT DO UPDATE`

## Verification

- `npm run db:seed` â€” Verify all INSERTs succeed without FK errors

## Next Steps

- TASK-012: API E-Resep routes [ME]
- TASK-013: API Lab/Radiologi routes [ME]
- TASK-014: WebSocket events [ME]
- TASK-017: E2E integration tests [Both]
