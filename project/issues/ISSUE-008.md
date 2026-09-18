# ISSUE-008: Ekspansi Sidebar Frontend â€” 5 Modul Baru

**Issue ID:** ISSUE-008
**Epic:** EPIQUE-ORANGB
**Status:** Open
**Priority:** High
**Assignee:** Orang B
**Type:** Frontend
**Estimated:** 4 jam

---

## Description

Perluas komponen navigasi Sidebar.tsx dengan menambahkan entri menu untuk 5 modul baru: SOPHI, Vaksin, Konsultasi Tumbuh Kembang, Denver II, dan Konsultasi Makan.

## Requirements

Setiap entri harus memiliki:
- `href` routing terdaftar di `App.tsx`
- Guard permissions via `authStore.hasPermission()`
- Ikon dari `lucide-react` yang konsisten dengan `NAV_ICONS`
- State aktif berbasis `useLocation`
- Pengelompokan hierarkis
- Fallback placeholder page untuk modul yang belum terimplementasi

## Acceptance Criteria

- [ ] 5 entri menu muncul di Sidebar dengan ikon lucide-react
- [ ] Setiap entri punya `href` di `App.tsx`
- [ ] `ProtectedRoute` guard via `authStore.hasPermission()`
- [ ] Active state via `useLocation`
- [ ] Hierarchical grouping (satu section untuk semua 5 modul)
- [ ] 5 placeholder page components ada di `frontend/src/pages/`
- [ ] `npm run build` (frontend) lolos

## Related Tasks

- TASK-008

## Notes

- Permission naming: `sophi.view`, `vaksin.view`, `tumbuh_kembang.view`, `denver_ii.view`, `konsultasi_makan.view`
- Group: "Klinik & Tumbuh Kembang"
- Icons: `Brain` (SOPHI), `Shield` (Vaksin), `TrendingUp` (Tumbuh Kembang), `Activity` (Denver II), `Utensils` (Konsultasi Makan)
