# ISSUE-005: Pembuatan ERD Visual

**Issue ID:** ISSUE-005
**Epic:** EPIQUE-ORANGB
**Status:** Open
**Closed:** 2026-09-18 (via TASK-006, dokumen desain lengkap)
**Priority:** Medium
**Assignee:** Orang B
**Type:** Documentation
**Estimated:** 2 jam

---

## Description

Buat diagram ERD visual yang menampilkan hubungan semua 14 tabel Orang B + tabel existing 001.

## Acceptance Criteria

- [ ] ERD diagram ada di `docs/superpowers/specs/2026-09-18-orangb-module-design.md`
- [ ] Semua relasi FK terlihat jelas
- [ ] 3 contoh alur data (INSERT statements) tersedia
- [ ] Contoh mencakup status transitions

## Related Tasks

- TASK-006

## Notes

- ERD menggunakan Mermaid syntax di design doc
- 14 tabel Orang B: arsip_lokasi, arsip_map, arsip_pinjam, arsip_pinjam_detail, resep, resep_item, pemeriksaan, pemeriksaan_item, pemeriksaan_hasil, pemeriksaan_log
- Hubungan ke tabel 001: users, pasien, kunjungan, layanan
