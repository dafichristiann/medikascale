# TASK-014: WebSocket Events — Orang B Modules

**Task ID:** TASK-014
**Epic:** EPIQUE-ORANGB
**Status:** Pending
**Priority:** Medium
**Assignee:** Orang B (ME)
**Type:** Backend
**Estimated:** 2 jam
**Depends On:** TASK-012, TASK-013, TASK-015
**Blockers:** ISSUE-005
**Created:** 2026-09-18

---

## Description

Tambahkan WebSocket event broadcast untuk Notifikasi real-time pada status changes di modul Orang B.

## Events

### E-Resep
- `resep:created` — saat resep dibuat (dokter → apoteker)
- `resep:status-updated` — saat status berubah (dokter/apoteker)
- `resep:sent` — resep dikirim ke apoteker (notifikasi)

### Pemeriksaan
- `pemeriksaan:created` — dokter buat permintaan (petugas_lab notified)
- `pemeriksaan:status-updated` — status berubah
- `pemeriksaan:result-added` — hasil dimasukkan (dokter notified for review)

### Arsip
- `arsip:pinjam-created` — peminjaman baru (map status updated)
- `arsip:returned` — pengembalian (map status updated)

## Implementation

- Gunakan WebSocket server yang sudah ada di `frontend/src/hooks/useWebSocket.ts`
- Tambahkan event emit di `resepService.ts`, `pemeriksaanService.ts`, `arsipService.ts` setelah status change
- Frontend: tambahkan event listener di masing-masing halaman
- Broadcast ke room berdasarkan role (apoteker room, lab room, dokter room)

## Files to Modify

```
backend/src/services/
  resepService.ts — emit event
  pemeriksaanService.ts — emit event
backend/src/server.ts — WebSocket event handlers
frontend/src/hooks/
  useWebSocket.ts — tambah handler untuk Orang B events
frontend/src/pages/
  ResepListPage.tsx — listen for updates
  LabProcessPage.tsx — listen for updates
```

## Acceptance Criteria

- [ ] 3 event types (resep, pemeriksaan, arsip) broadcast
- [ ] Real-time update di halaman terkait
- [ ] Room-based broadcasting (role-specific)
- [ ] Fallback jika WebSocket disconnect
- [ ] `npm run build` (backend + frontend) lolos

## Next Steps

- TASK-015: Seed new roles/demo users [ME]
- TASK-017: E2E integration tests [Both]
