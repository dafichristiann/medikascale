# TASK-018: Build Verification & Deploy Check

**Task ID:** TASK-018
**Epic:** EPIQUE-ORANGB
**Status:** Pending
**Priority:** Medium
**Assignee:** Orang B (Both)
**Type:** Verification
**Estimated:** 1 jam
**Depends On:** TASK-012, TASK-013, TASK-014, TASK-015, TASK-016
**Blockers:** ISSUE-006
**Created:** 2026-09-18

---

## Description

Verifikasi build frontend dan backend, lint, typecheck. Pastikan semuanya siap deploy.

## Verification Checklist

### Backend
- [ ] `npm run build` (backend) → tsc compile ok
- [ ] `npm run db:migrate` → 001 + 002 berjalan tanpa error
- [ ] `npm run db:seed` → seed data berhasil
- [ ] `npm run lint` (backend) → no errors
- [ ] `npm run typecheck` (backend) → no errors

### Frontend
- [ ] `npm run build` (frontend) → tsc compile ok
- [ ] `npm run lint` (frontend) → no errors
- [ ] `npm run typecheck` (frontend) → no errors
- [ ] `npm run dev` (frontend) → no runtime errors

### Integration
- [ ] Database migration berjalan secara berurutan (001 → 002)
- [ ] Seed data ter-insert dengan benar (roles, permissions, users, demo users)
- [ ] API routes merespons dengan benar (test dengan curl/postman)
- [ ] WebSocket connection establised
- [ ] Permission gate berfungsi di semua halaman

## Files to Check

- `backend/package.json` — scripts correct
- `frontend/package.json` — scripts correct
- `backend/tsconfig.json` — compilerOptions correct
- `frontend/tsconfig.json` — compilerOptions correct
- `.env` files — database URL, JWT secret correct

## Acceptance Criteria

- [ ] `npm run build` frontend + backend lolos
- [ ] `npm run lint` frontend + backend lolos
- [ ] `npm run typecheck` frontend + backend lolos
- [ ] Migration berjalan tanpa error
- [ ] Seed berjalan tanpa error
- [ ] Semua API routes merespons
- [ ] WebSocket terhubung
- [ ] Permission gate berfungsi

## Next Steps

- TIDAK ADA — ini adalah tugas terakhir dalam sprint
