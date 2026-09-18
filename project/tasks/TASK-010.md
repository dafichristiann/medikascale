# TASK-010: Frontend Halaman Laboratorium, Radiologi & Arsip

**Task ID:** TASK-010
**Epic:** EPIQUE-ORANGB
**Status:** Completed
**Priority:** High
**Assignee:** Orang B (USER)
**Type:** Frontend
**Estimated:** 4 hours
**Depends On:** TASK-009
**Blockers:** ISSUE-009
**Created:** 2026-09-18

---

## Description

Buat halaman frontend untuk modul Laboratorium, Radiologi, dan Arsip Rekam Medis.

## Deliverables

### Laboratorium & Radiologi
- **Doctor Order Page**: Form permintaan pemeriksaan (kunjungan picker, item list, jenis laboratorium/radiologi)
- **Staff Process Page**: Daftar permintaan diterima, proses pemeriksaan, input nilai + interpretasi
- **Doctor Review Page**: Tinjau hasil, approve/reject

### Arsip
- **Lokasi Manager**: CRUD arsip_lokasi (lantai, ruang, rak, baris)
- **Map Manager**: Pencarian map by no_rm, no_map, nama pasien, lokasi
- **Pinjam/Kembalikan Modal**: Form keterangan wajib, status flow tersediaâ†’dipinjam, dipinjamâ†’dikembalikan
- **History Table**: Riwayat peminjaman (tidak di-DELETE)

## UI Pattern

Reuse existing components:
- `Card`, `Button`, `Field`, `Select`, `Input` dari `frontend/src/components/ui/UI.tsx`
- `StatusBadge` pattern dari `AntrianList`
- `AntropometriInput` pattern untuk form item dinamis
- `Table` pattern untuk list/history

## Files to Create

```
frontend/src/pages/
  LabOrderPage.tsx
  LabProcessPage.tsx
  LabReviewPage.tsx
  ArsipLokasiPage.tsx
  ArsipMapPage.tsx
  ArsipPinjamPage.tsx
  ArsipHistoryPage.tsx
```

## Acceptance Criteria

- [x] 7 halaman baru ada di `frontend/src/pages/`
- [x] Setiap halaman punya routing di `App.tsx`
- [x] `ProtectedRoute` guard berdasarkan permission user
- [x] Layout konsisten dengan halaman ada
- [x] Form dinamis (item rows) mengikuti pattern existing
- [x] `npm run build` (frontend) lolos

## Next Steps

- TASK-011: Frontend E-Resep pages [ME]
