# TASK-008: Ekspansi Sidebar Frontend â€” 5 Modul Baru

**Task ID:** TASK-008
**Epic:** EPIQUE-ORANGB
**Status:** Pending
**Priority:** High
**Assignee:** Orang B (USER)
**Type:** Frontend
**Estimated:** 4 hours
**Depends On:** TASK-007
**Blockers:** ISSUE-008
**Created:** 2026-09-18

---

## Description

Perluas komponen navigasi Sidebar.tsx dengan menambahkan entri menu untuk 5 modul baru: SOPHI, Vaksin, Konsultasi Tumbuh Kembang, Denver II, dan Konsultasi Makan.

## Requirements

Setiap entri harus memiliki:
- `href` routing terdaftar di `App.tsx`
- Guard permissions via `authStore.hasPermission()`
- Ikon dari `lucide-react` yang konsisten dengan `NAV_ICONS`
- State aktif berbasis `useLocation`
- Pengelompokan hierarkis (grouped sections)
- Fallback placeholder page untuk modul yang belum terimplementasi

## Modul Baru

| Modul | Permission | Ikon Lucide | Group |
|-------|-----------|-------------|-------|
| SOPHI | `sophi.view` | `Brain` | Klinik & Tumbuh Kembang |
| Vaksin | `vaksin.view` | `Shield` | Klinik & Tumbuh Kembang |
| Konsultasi Tumbuh Kembang | `tumbuh_kembang.view` | `TrendingUp` | Klinik & Tumbuh Kembang |
| Denver II | `denver_ii.view` | `Activity` | Klinik & Tumbuh Kembang |
| Konsultasi Makan | `konsultasi_makan.view` | `Utensils` | Klinik & Tumbuh Kembang |

## Files to Modify

- `frontend/src/components/layout/Sidebar.tsx` â€” Tambah `NAV_ITEMS` dengan 5 entri baru + grouping
- `frontend/src/App.tsx` â€” Tambah 5 `<Route>` baru dengan `ProtectedRoute` guard
- `frontend/src/pages/` â€” Buat 5 placeholder page components (e.g., `SophiPage.tsx`, `VaksinPage.tsx`, dll.)
- `frontend/src/store/authStore.ts` â€” Pastikan `hasPermission` support new permission strings

## Page Components (Placeholder)

Setiap page harus:
- Export default component
- Layout konsisten dengan halaman ada (Card, Header, stat placeholder)
- Tidak ada logic tambahan â€” placeholder saja

## Acceptance Criteria

- [ ] 5 entri menu muncul di Sidebar dengan ikon lucide-react
- [ ] Setiap entri punya `href` di `App.tsx`
- [ ] `ProtectedRoute` guard via `authStore.hasPermission()`
- [ ] Active state via `useLocation`
- [ ] Hierarchical grouping (satu section untuk semua 5 modul)
- [ ] 5 placeholder page components ada di `frontend/src/pages/`
- [ ] `npm run build` (frontend) lolos

## Verification

- `cd frontend && npm run build` â†’ tsc compile ok âœ…

## Output

- `frontend/src/components/layout/Sidebar.tsx` â€” Updated NAV_ITEMS
- `frontend/src/App.tsx` â€” 5 new routes
- `frontend/src/pages/{Sophi,Vaksin,TumbuhKembang,DenverIi,KonsultasiMakan}Page.tsx` â€” Placeholder

## Next Steps

- TASK-009: Frontend E-Resep pages [ME]
- TASK-010: Frontend Lab/Radiologi + Arsip pages [USER]
