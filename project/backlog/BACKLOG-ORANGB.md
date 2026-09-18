# BACKLOG-ORANGB: Product Backlog Items

**Backlog ID:** BACKLOG-ORANGB  
**Epic:** EPIQUE-ORANGB  
**Project:** MedikaScale  
**Created:** 2026-09-18  
**Updated:** 2026-09-18  

---

## Backlog Items

### High Priority

| ID | Title | Description | Story Points | Status |
|----|-------|-------------|:------------:|--------|
| BACK-001 | Desain tabel arsip rekam medis | 4 tabel: arsip_lokasi, arsip_map, arsip_pinjam, arsip_pinjam_detail | 8 | Pending |
| BACK-002 | Desain tabel e-resep | 2 tabel: resep, resep_item | 5 | Pending |
| BACK-003 | Desain tabel laboratorium & radiologi | 4 tabel: pemeriksaan, pemeriksaan_item, pemeriksaan_hasil, pemeriksaan_log | 8 | Pending |
| BACK-004 | Implementasi SQL migration | File `002_orangb_init_schema.ts` | 5 | Pending |
| BACK-005 | Integrasi permission baru ke RBAC | 15 permission baru + 3 role baru | 3 | Pending |
| BACK-006 | ERD visual | Diagram hubungan semua tabel | 3 | Pending |
| BACK-007 | Contoh alur data | SQL examples untuk 3 modul | 3 | Pending |
| BACK-016 | API Routes â€” Arsip | 12 endpoint arsip | 8 | Pending |
| BACK-017 | E2E Integration Tests | 3 scenario end-to-end | 3 | Pending |
| BACK-018 | Build Verification & Deploy Check | Frontend + backend verification | 1 | Pending |

### Medium Priority

| ID | Title | Description | Story Points | Status |
|----|-------|-------------|:------------:|--------|
| BACK-008 | Frontend pages untuk Orang B | Halaman arsip, resep, pemeriksaan | 13 | Pending |
| BACK-009 | API routes untuk Orang B | Backend endpoints (resep + pemeriksaan) | 8 | Pending |
| BACK-010 | WebSocket events untuk Orang B | Real-time updates | 5 | Pending |
| BACK-011 | Export arsip ke PDF/CSV | Laporan arsip | 5 | Pending |
| BACK-012 | Notifikasi untuk resep | Email/SMS ke apoteker | 5 | Pending |
| BACK-013 | Dashboard Orang B | Dashboard khusus modul Orang B | 8 | Pending |
| BACK-014 | Mobile responsive untuk Orang B | Mobile layout | 5 | Pending |
| BACK-015 | Testing dan QA | Unit tests, integration tests | 8 | Pending |

### New Frontend Modules (Placeholder)

| ID | Title | Description | Story Points | Status |
|----|-------|-------------|:------------:|--------|
| BACK-019 | Sidebar expansion â€” 5 modul baru | SOPHI, Vaksin, Tumbuh Kembang, Denver II, Konsultasi Makan | 5 | Pending |
| BACK-020 | Frontend pages â€” Lab/Radiologi + Arsip | 7 halaman baru | 13 | Pending |
| BACK-021 | Frontend pages â€” E-Resep | 3 halaman baru | 8 | Pending |

---

## Velocity Estimate

- Sprint 1 (Week 1): BACK-001 through BACK-007 (Design + Migration complete âœ…)
- Sprint 2 (Week 2): BACK-008, BACK-009, BACK-010, BACK-016 (Frontend + API)
- Sprint 3 (Week 3): BACK-011 through BACK-018 (Polish, tests, verification)
- Sprint 4 (Week 4): BACK-019 through BACK-021 (New modules)

## Definition of Done

- [ ] Desain terdokumentasi
- [ ] Migration berjalan tanpa error
- [ ] FK constraints valid
- [ ] Index dibuat
- [ ] Frontend permission gate berfungsi
- [ ] Tests lolos
- [ ] Code review selesai

## Notes

- Backlog ini akan terus diperbarui seiring dengan proses pengembangan
- Priority dapat berubah berdasarkan dependency dan stakeholder feedback
- Setiap item harus terhubung ke epic dan issue yang relevan
- Sprint 1 completed: BACK-001 through BACK-007 âœ…
