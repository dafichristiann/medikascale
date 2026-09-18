# TASK-017: API Routes — Arsip

**Task ID:** TASK-017
**Epic:** EPIQUE-ORANGB
**Status:** Pending
**Priority:** High
**Assignee:** Orang B (ME)
**Type:** Backend
**Estimated:** 3 jam
**Depends On:** TASK-005
**Blockers:** ISSUE-001
**Created:** 2026-09-18

---

## Description

Buat API routes, controllers, dan services untuk modul Arsip Rekam Medis.

## Routes

| Method | Path | Description | Permission |
|--------|------|-------------|------------|
| `POST` | `/api/arsip/lokasi` | Buat lokasi baru | `arsip.manage` (arsiparis) |
| `GET` | `/api/arsip/lokasi` | List lokasi (filter by lantai/ruang) | `arsip.view` |
| `PUT` | `/api/arsip/lokasi/:id` | Update lokasi | `arsip.manage` |
| `DELETE` | `/api/arsip/lokasi/:id` | Hapus lokasi (soft) | `arsip.manage` |
| `POST` | `/api/arsip/map` | Buat map baru | `arsip.manage` |
| `GET` | `/api/arsip/map` | List map (search by no_rm/no_map/nama) | `arsip.view` |
| `GET` | `/api/arsip/map/:id` | Detail map | `arsip.view` |
| `PUT` | `/api/arsip/map/:id/status` | Update status (tersedia/dipinjam/dikembalikan) | `arsip.pinjam` |
| `POST` | `/api/arsip/pinjam` | Buat peminjaman | `arsip.pinjam` |
| `PUT` | `/api/arsip/pinjam/:id/kembalikan` | Kembalikan map | `arsip.kembalikan` |
| `GET` | `/api/arsip/pinjam` | List peminjaman (filter by status) | `arsip.view` |
| `GET` | `/api/arsip/pinjam/:id/detail` | Detail pinjaman + dokumen | `arsip.view` |

## Permission Matrix

| Action | Role | Permission |
|--------|------|------------|
| Kelola lokasi/map | arsiparis | `arsip.manage` |
| Lihat data | arsiparis/dokter | `arsip.view` |
| Pinjam map | arsiparis/dokter | `arsip.pinjam` |
| Kembalikan map | arsiparis | `arsip.kembalikan` |

## Status Flow

```
tersedia → dipinjam → dikembalikan
```

- `tersedia` → map tersedia untuk dipinjam
- `dipinjam` → map sedang dipinjam, tanggal_kembali NULL
- `dikembalikan` → map sudah dikembalikan, tanggal_kembali terisi

## Files to Create

```
backend/src/controllers/
  arsipController.ts
backend/src/routes/
  arsipRoutes.ts
backend/src/services/
  arsipService.ts
```

## Acceptance Criteria

- [ ] Semua 12 endpoint berfungsi
- [ ] Permission gate berfungsi
- [ ] Status flow enforced: tersedia → dipinjam → dikembalikan
- [ ] `arsip_pinjam_detail` didukung (multi-dokumen per pinjam)
- [ ] History preserved (tidak ada DELETE)
- [ ] WebSocket event `arsip:pinjam-created` dan `arsip:returned` broadcast
- [ ] `npm run build` (backend) lolos

## Next Steps

- TASK-014: WebSocket events [ME]
- TASK-015: Seed new roles/demo users [ME]
