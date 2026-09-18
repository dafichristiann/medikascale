# TASK-006: Buat ERD Visual & Contoh Alur Data

**Task ID:** TASK-006
**Epic:** EPIQUE-ORANGB
**Status:** Pending
**Priority:** High
**Assignee:** Orang B
**Type:** Documentation
**Estimated:** 2 hours
**Depends On:** TASK-003, TASK-004
**Blockers:** ISSUE-005
**Created:** 2026-09-18

---

## Description

Buat ERD visual (Mermaid) dan contoh alur data (INSERT examples) untuk ketiga modul.

## Deliverables

- [ ] `docs/superpowers/specs/2026-09-18-orangb-module-design.md` — Section 6 (ERD)
- [ ] `docs/superpowers/specs/2026-09-18-orangb-module-design.md` — Section 7 (Data Flow Examples)
- [ ] Diagram hubungan semua 14 tabel + tabel existing 001
- [ ] SQL examples: INSERT resep → resep_item → update status
- [ ] SQL examples: INSERT pemeriksaan → pemeriksaan_item → pemeriksaan_hasil → update status
- [ ] SQL examples: INSERT arsip_lokasi → arsip_map → arsip_pinjam → arsip_pinjam_detail → update status

## ERD Structure

```
[users] ←--- [pasien] ←--- [kunjungan] ←--- [layanan]
                    ↕               ↕                  ↕
          [arsip_map]    [resep]       [pemeriksaan]
          [arsip_lokasi] [resep_item]  [pemeriksaan_item]
          [arsip_pinjam]             [pemeriksaan_hasil]
          [arsip_pinjam_detail]      [pemeriksaan_log]
```

## Acceptance Criteria

- [ ] ERD Mermaid diagram ada di design doc
- [ ] Semua relasi FK terlihat jelas
- [ ] 3 contoh alur data (INSERT statements) tersedia
- [ ] Contoh mencakup status transitions

## Output

- `docs/superpowers/specs/2026-09-18-orangb-module-design.md` — Sections 6, 7

## Next Steps

- TASK-007: RBAC permissions seed
