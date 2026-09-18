# TASK-013: API Routes — Laboratorium & Radiologi

**Task ID:** TASK-013
**Epic:** EPIQUE-ORANGB
**Status:** Pending
**Priority:** High
**Assignee:** Orang B (ME)
**Type:** Backend
**Estimated:** 4 jam
**Depends On:** TASK-005
**Blockers:** ISSUE-003
**Created:** 2026-09-18

---

## Description

Buat API routes, controllers, dan services untuk modul Laboratorium & Radiologi.

## Routes

| Method | Path | Description | Permission |
|--------|------|-------------|------------|
| `POST` | `/api/pemeriksaan` | Buat permintaan pemeriksaan | `pemeriksaan.create` (dokter) |
| `GET` | `/api/pemeriksaan` | List pemeriksaan (filter by status/jenis) | `pemeriksaan.view` |
| `GET` | `/api/pemeriksaan/:id` | Detail + items + results | `pemeriksaan.view` |
| `GET` | `/api/pemeriksaan/pasien/:pasienId` | Pemeriksaan by pasien | `pemeriksaan.view` |
| `PUT` | `/api/pemeriksaan/:id/status` | Update status (terima/jadwalkan/proses/selesai/batal) | Role-specific |
| `POST` | `/api/pemeriksaan/:id/items` | Tambah item pemeriksaan | `pemeriksaan.create` |
| `POST` | `/api/pemeriksaan/:id/hasil` | Input hasil pemeriksaan | `pemeriksaan.process` (petugas_lab) |
| `PUT` | `/api/pemeriksaan/hasil/:id/review` | Tinjau hasil (approve/reject) | `pemeriksaan.review` (dokter) |

## Permission Matrix

| Action | Role | Permission |
|--------|------|------------|
| Buat permintaan | dokter | `pemeriksaan.create` |
| Lihat daftar | semua | `pemeriksaan.view` |
| Terima/jadwalkan/proses | petugas_lab | `pemeriksaan.process` |
| Input hasil | petugas_lab | `pemeriksaan.process` |
| Tinjau hasil | dokter | `pemeriksaan.review` |

## Files to Create

```
backend/src/controllers/
  pemeriksaanController.ts
backend/src/routes/
  pemeriksaanRoutes.ts
backend/src/services/
  pemeriksaanService.ts
```

## Status Flow Logic

```
diminta → diterima → dijadwalkan → diproses → selesai
                                  ↘ dibatalkan
```

- `diminta` → dokter melihat
- `diterima` → petugas_lab melihat
- `dijadwalkan` → jadwal ditetapkan
- `diproses` → petugas memasukkan item + hasil
- `selesai` → dokter meninjau
- `dibatalkan` → dicatat, tidak dihapus

## Acceptance Criteria

- [ ] Semua 8 endpoint berfungsi
- [ ] Permission gate berfungsi
- [ ] Status flow enforced
- [ ] `pemeriksaan_hasil` support `menunggu` → `diproses` → `ditinjau` internal flow
- [ ] WebSocket event `pemeriksaan:update` broadcast
- [ ] `npm run build` (backend) lolos

## Next Steps

- TASK-014: WebSocket events [ME]
- TASK-015: Seed new roles/demo users [ME]
