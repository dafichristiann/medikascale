# TASK-009: Tambahkan Permission Baru ke RBAC

**Task ID:** TASK-009
**Epic:** EPIQUE-ORANGB
**Status:** Completed
**Priority:** High
**Assignee:** Orang B
**Type:** Implementation
**Estimated:** 1 jam
**Depends On:** TASK-005
**Blockers:** ISSUE-007
**Created:** 2026-09-18

---

## Description

Tambahkan 12 permission baru dan 3 role baru ke sistem RBAC.

## New Roles (3)

| Role | Description |
|------|-------------|
| `apoteker` | Apoteker â€” proses, selesaikan resep |
| `petugas_lab` | Petugas Lab/Radiologi â€” terima, proses, catat hasil |
| `arsiparis` | Arsiparis â€” kelola lokasi, map, peminjaman |

## New Permissions (12)

### Arsip (4)
- `arsip.view`, `arsip.manage`, `arsip.pinjam`, `arsip.kembalikan`

### E-Resep (4)
- `resep.view`, `resep.create`, `resep.send`, `resep.process`, `resep.complete`, `resep.cancel`

### Pemeriksaan (4)
- `pemeriksaan.view`, `pemeriksaan.create`, `pemeriksaan.process`, `pemeriksaan.review`

## Role-Permission Mapping

| Role | Tambahan Permissions |
|------|----------------------|
| `dokter` | `resep.create`, `resep.send`, `pemeriksaan.create`, `pemeriksaan.review`, `arsip.pinjam` |
| `apoteker` | `resep.view`, `resep.process`, `resep.complete`, `resep.cancel` |
| `petugas_lab` | `pemeriksaan.view`, `pemeriksaan.process`, `pemeriksaan.create` |
| `arsiparis` | `arsip.view`, `arsip.manage`, `arsip.pinjam`, `arsip.kembalikan` |

## Files to Modify

- `backend/src/db/seed.ts` â€” INSERT baru ke `roles`, `permissions`, `role_permissions`, `users`
- Tambahkan role `apoteker`, `petugas_lab`, `arsiparis` dengan password default
- Tambahkan permission strings ke `users` array untuk role yang ada

## Acceptance Criteria

- [ ] 12 permission baru ada di tabel `permissions`
- [ ] 3 role baru ada di tabel `roles`
- [ ] Role-permission mapping benar di `role_permissions`
- [ ] Seed berjalan tanpa error: `npm run db:seed`
- [ ] `seed.ts` menggunakan `ON CONFLICT DO NOTHING` / `ON CONFLICT DO UPDATE`

## Verification

- `npm run db:seed` â€” Verify all INSERTs succeed without FK errors

## Next Steps

- TASK-008: Frontend sidebar expansion [USER]
- TASK-010: Frontend Lab/Radiologi + Arsip pages [USER]
- TASK-011: Frontend E-Resep pages [ME]
- TASK-012: API E-Resep routes [ME]
- TASK-013: API Lab/Radiologi routes [ME]
- TASK-014: API Arsip routes [ME]
- TASK-015: WebSocket events [ME]
- TASK-016: Seed new roles/demo users [ME]
- TASK-017: E2E integration tests [Both]
- TASK-018: Build verification [Both]
