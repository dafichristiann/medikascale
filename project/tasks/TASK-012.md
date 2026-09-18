# TASK-012: API Routes — E-Resep

**Task ID:** TASK-012
**Epic:** EPIQUE-ORANGB
**Status:** Pending
**Priority:** High
**Assignee:** Orang B (ME)
**Type:** Backend
**Estimated:** 4 hours
**Depends On:** TASK-005
**Blockers:** ISSUE-002
**Created:** 2026-09-18

---

## Description

Buat API routes, controllers, dan services untuk modul E-Resep.

## Routes

| Method | Path | Description | Permission |
|--------|------|-------------|------------|
| `POST` | `/api/resep` | Buat resep baru | `resep.create` (dokter) |
| `GET` | `/api/resep` | List resep (filter by status/pasien) | `resep.view` |
| `GET` | `/api/resep/:id` | Detail resep + items | `resep.view` |
| `GET` | `/api/resep/kunjungan/:kunjunganId` | Resep by kunjungan | `resep.view` |
| `PUT` | `/api/resep/:id/status` | Update status (kirim/proses/selesai/batal) | Role-specific |
| `POST` | `/api/resep/:id/items` | Tambah item resep | `resep.create` |

## Permission Matrix

| Action | Role | Permission |
|--------|------|------------|
| Buat resep | dokter | `resep.create` |
| Kirim resep | dokter | `resep.send` |
| Proses resep | apoteker | `resep.process` |
| Selesaikan resep | apoteker | `resep.complete` |
| Batalkan resep | apoteker/dokter | `resep.cancel` |

## Files to Create

```
backend/src/controllers/
  resepController.ts
backend/src/routes/
  resepRoutes.ts
backend/src/services/
  resepService.ts
```

## Status Flow Logic

```
dibuat → dikirim → diproses → siap → selesai
                                  ↘ dibatalkan
```

- `dibuat` → hanya dokter bisa lihat/edit
- `dikirim` → apoteker menerima notifikasi
- `diproses` → apoteker mulai proses
- `siap` → resep siap diambil
- `selesai` → final, tidak bisa diubah
- `dibatalkan` → dicatat di log, tidak dihapus

## Acceptance Criteria

- [ ] Semua 6 endpoint berfungsi
- [ ] Permission gate berfungsi (hanya role yang berwenang bisa akses)
- [ ] Status flow enforced via CHECK constraint + application validation
- [ ] WebSocket event `resep:update` broadcast setelah status change
- [ ] `npm run build` (backend) lolos

## Next Steps

- TASK-014: WebSocket events [ME]
- TASK-015: Seed new roles/demo users [ME]
