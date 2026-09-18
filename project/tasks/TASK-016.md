# TASK-016: E2E Integration Tests

**Task ID:** TASK-016
**Epic:** EPIQUE-ORANGB
**Status:** Pending
**Priority:** Medium
**Assignee:** Orang B (Both)
**Type:** Testing
**Estimated:** 3 jam
**Depends On:** TASK-012, TASK-013, TASK-014, TASK-015
**Blockers:** ISSUE-006
**Created:** 2026-09-18

---

## Description

Buat dan jalankan scenario pengujian end-to-end untuk semua 3 modul Orang B.

## Test Scenarios

### Scenario 1: E-Resep Flow
1. Dokter login → buat resep → kirim ke apoteker
2. Apoteker login → lihat resep masuk → proses → selesai
3. Verify status flow: `dibuat` → `dikirim` → `diproses` → `selesai`
4. Verify WebSocket event broadcast

### Scenario 2: Lab/Radiologi Flow
1. Dokter login → buat permintaan pemeriksaan (laboratorium) → kirim
2. Petugas_lab login → terima → proses → input hasil
3. Dokter login → tinjau → approve
4. Verify status flow: `diminta` → `diterima` → `diproses` → `selesai`

### Scenario 3: Arsip Flow
1. Arsiparis login → buat arsip_lokasi → buat arsip_map
2. Arsiparis login → pinjam → kembalikan
3. Verify status flow: `tersedia` → `dipinjam` → `dikembalikan`
4. Verify history preserved (tidak ada DELETE)

## Files to Create

```
project/tests/
  e2e-resep.test.ts
  e2e-pemeriksaan.test.ts
  e2e-arsip.test.ts
```

## Acceptance Criteria

- [ ] 3 scenario berjalan tanpa error
- [ ] Semua status transitions verified
- [ ] WebSocket events verified
- [ ] Permission gates verified (unauthorized access rejected)
- [ ] FK constraints verified (orphan records rejected)

## Next Steps

- TASK-018: Build verification [Both]
