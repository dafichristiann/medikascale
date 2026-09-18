# TASK-011: Frontend Halaman E-Resep

**Task ID:** TASK-011
**Epic:** EPIQUE-ORANGB
**Status:** Completed
**Priority:** High
**Assignee:** Orang B (ME)
**Type:** Frontend
**Estimated:** 3 hours
**Depends On:** TASK-009
**Blockers:** ISSUE-002
**Created:** 2026-09-18

---

## Description

Buat halaman frontend untuk modul E-Resep.

## Deliverables

### Doctor View (Create & Send)
- **ResepFormPage**: Form resep baru (kunjungan picker, dynamic item rows: obat + dosis + jumlah + frekuensi + aturan + instruksi, tombol Kirim)
- Status: `dibuat` → `dikirim`

### Apoteker View (Process & Complete)
- **ResepListPage**: Daftar resep masuk, filter by status
- **ResepDetailPage**: Detail resep, tombol Proses/Selesai/Batal
- Status: `diproses` → `siap` → `selesai` atau `dibatalkan`

## UI Pattern

Reuse existing components:
- `Card`, `Button`, `Field`, `Select`, `Input` dari `frontend/src/components/ui/UI.tsx`
- `StatusBadge` pattern dari `AntrianList`
- `AntropometriInput` pattern untuk form item dinamis

## Files to Create

```
frontend/src/pages/
  ResepFormPage.tsx
  ResepListPage.tsx
  ResepDetailPage.tsx
```

## Acceptance Criteria

- [x] 3 halaman baru ada di `frontend/src/pages/`
- [x] Setiap halaman punya routing di `App.tsx`
- [x] `ProtectedRoute` guard berdasarkan permission user
- [x] Form dinamis (item rows) mengikuti pattern existing
- [x] Status flow UI: dibuat → dikirim → diproses → siap → selesai / dibatalkan
- [x] `npm run build` (frontend) lolos

## Next Steps

- TASK-012: API E-Resep routes [ME]
