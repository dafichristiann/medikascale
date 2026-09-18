# TASK-007: Tambahkan Permission Baru ke RBAC

**Task ID:** TASK-007
**Epic:** EPIQUE-ORANGB
**Status:** Completed
**Priority:** High
**Assignee:** Orang B
**Type:** Implementation
**Estimated:** 1 jam
**Depends On:** TASK-005
**Blockers:** ISSUE-007
**Created:** 2026-09-18

---

## Description

Tambahkan 15 permission baru ke tabel `permissions` dan assign ke roles via `role_permissions`. Tambahkan 3 role baru: `apoteker`, `petugas_lab`, `arsiparis`.

## New Roles

| Role | Description |
|------|-------------|
| `apoteker` | Apoteker â€” memproses, menyiapkan, dan menyelesaikan resep |
| `petugas_lab` | Petugas Laboratorium & Radiologi â€” menerima, memproses, dan mencatat hasil pemeriksaan |
| `arsiparis` | Arsiparis â€” mengelola lokasi, map, dan transaksi peminjaman arsip |

## New Permissions (15 total)

### Arsip (4)
- `arsip.view` â€” Lihat data arsip
- `arsip.manage` â€” Kelola lokasi dan map
- `arsip.pinjam` â€” Pinjam map rekam medis
- `arsip.kembalikan` â€” Kembalikan map yang dipinjam

### E-Resep (4)
- `resep.view` â€” Lihat resep
- `resep.create` â€” Buat resep baru (dokter)
- `resep.send` â€” Kirim resep ke apoteker (dokter)
- `resep.process` + `resep.complete` + `resep.cancel` (gabungkan untuk apoteker sebagai `resep.process`, `resep.complete`, `resep.cancel`)

### Pemeriksaan (4)
- `pemeriksaan.view` â€” Lihat data pemeriksaan
- `pemeriksaan.create` â€” Buat permintaan pemeriksaan (dokter)
- `pemeriksaan.process` â€” Proses pemeriksaan (petugas_lab)
- `pemeriksaan.review` â€” Tinjau hasil (dokter)

### Arsiparis tambahan (3)
- `resep.view` (untuk apoteker melihat resep pasien)

**Total unique permissions baru: 12** (4 arsip + 4 resep + 4 pemeriksaan)

## Role-Permission Mapping

| Role | Permissions Baru |
|------|-------------------|
| `dokter` | `resep.create`, `resep.send`, `pemeriksaan.create`, `pemeriksaan.review`, `arsip.pinjam` |
| `apoteker` | `resep.view`, `resep.process`, `resep.complete`, `resep.cancel` |
| `petugas_lab` | `pemeriksaan.view`, `pemeriksaan.process`, `pemeriksaan.create` |
| `arsiparis` | `arsip.view`, `arsip.manage`, `arsip.pinjam`, `arsip.kembalikan` |
| `perawat` | (tidak berubah) |
| `admin` | (tidak berubah) |
| `staff_antrian` | (tidak berubah) |

## Files to Modify

- `backend/src/db/seed.ts` â€” Tambah INSERT ke `roles`, `permissions`, `role_permissions`, `users`
- `backend/src/db/migrate.ts` â€” Pastikan tabel `permissions`, `role_permissions` sudah ada di 001

## Acceptance Criteria

- [ ] 12 permission baru ada di tabel `permissions`
- [ ] 3 role baru ada di tabel `roles`
- [ ] Role-permission mapping benar di `role_permissions`
- [ ] Seed berjalan tanpa error: `npm run db:seed`
- [ ] `seed.ts` menggunakan `ON CONFLICT DO NOTHING` / `ON CONFLICT DO UPDATE`

## Output

- `backend/src/db/seed.ts` â€” Updated with new roles/permissions

## Verification

- `npm run db:seed` â€” Verify all INSERTs succeed without FK errors

## Next Steps

- TASK-008: Frontend sidebar expansion [USER]
- TASK-009: Frontend E-Resep pages [ME]
- TASK-010: Frontend Lab/Radiologi + Arsip pages [USER]
- TASK-011: API E-Resep routes [ME]
- TASK-012: API Lab/Radiologi routes [ME]
- TASK-013: API Arsip routes [ME]
