# ISSUE-009: Frontend Halaman Laboratorium, Radiologi & Arsip

**Issue ID:** ISSUE-009
**Epic:** EPIQUE-ORANGB
**Status:** Open
**Priority:** High
**Assignee:** Orang B
**Type:** Frontend
**Estimated:** 4 jam

---

## Description

Buat halaman frontend untuk modul Laboratorium, Radiologi, dan Arsip Rekam Medis.

## Acceptance Criteria

- [ ] 7 halaman baru ada di `frontend/src/pages/`
- [ ] Setiap halaman punya routing di `App.tsx`
- [ ] `ProtectedRoute` guard via `authStore.hasPermission()`
- [ ] Layout konsisten dengan halaman ada
- [ ] Form dinamis (item rows) mengikuti pattern existing
- [ ] `npm run build` (frontend) lolos

## Related Tasks

- TASK-010

## Notes

- Pages: LabOrderPage, LabProcessPage, LabReviewPage, ArsipLokasiPage, ArsipMapPage, ArsipPinjamPage, ArsipHistoryPage
- Reuse existing UI components (Card, Button, Field, Select, Input, StatusBadge)
