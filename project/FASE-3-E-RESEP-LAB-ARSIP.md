# Fase 3: E-Resep, Lab/Radiologi, dan Arsip Rekam Medis

**Status:** Selesai  
**Tanggal:** 2026-09-18  
**Rujukan:** TASK-010 / TASK-011

## Ruang Lingkup

Fase ini menambahkan antarmuka operasional untuk e-Resep, permintaan serta hasil Lab/Radiologi, dan arsip rekam medis. E-Resep serta Lab/Radiologi masih memakai adapter mock stateful, sedangkan Arsip sudah memiliki integrasi database PostgreSQL melalui API backend.

## Implementasi

### E-Resep

| Halaman | Rute | Permission utama |
|---|---|---|
| Buat e-Resep | `/resep/baru` | `resep.create`, `resep.send` |
| Daftar resep | `/resep` | `resep.view`, `resep.process` |
| Detail resep | `/resep/:id` | `resep.view` |

Form resep mendukung baris obat dinamis (obat, dosis, jumlah, frekuensi, aturan pakai, instruksi). Status mengikuti `dibuat → dikirim → diproses → siap → selesai`, dengan pembatalan sebelum selesai.

### Lab & Radiologi

| Halaman | Rute | Permission utama |
|---|---|---|
| Permintaan pemeriksaan | `/pemeriksaan/permintaan` | `pemeriksaan.create` |
| Proses pemeriksaan | `/pemeriksaan` | `pemeriksaan.view`, `pemeriksaan.process` |
| Review hasil | `/pemeriksaan/:id/review` | `pemeriksaan.review` |

Permintaan mendukung item dinamis kategori Laboratorium/Radiologi. Petugas dapat memulai proses dan mencatat nilai, satuan, nilai rujukan, serta interpretasi. Dokter dapat menyetujui atau mengembalikan hasil untuk koreksi.

### Arsip Rekam Medis

| Halaman | Rute | Permission utama |
|---|---|---|
| Manajemen lokasi | `/arsip/lokasi` | `arsip.manage` |
| Pencarian map | `/arsip/map` | `arsip.view` |
| Pinjam/kembalikan | `/arsip/peminjaman` | `arsip.pinjam`, `arsip.kembalikan` |
| Riwayat | `/arsip/riwayat` | `arsip.view` |

Pencarian map mendukung nomor RM, nomor map, nama pasien, dan lokasi. Transaksi pinjam/kembalikan mewajibkan keterangan dan selalu menambahkan entri riwayat; tidak ada aksi hapus riwayat. Lokasi yang masih digunakan map tidak dapat dihapus.

## Role demo Admin

Pemilih role `/demo-role` sekarang memiliki **Administrator** (`admin` / `demo123`) dengan seluruh permission frontend. Role ini digunakan untuk pengujian lintas modul dan tidak mengubah autentikasi backend produksi.

## File Terkait

- `frontend/src/pages/ResepFormPage.tsx`, `ResepListPage.tsx`, `ResepDetailPage.tsx`
- `frontend/src/pages/LabOrderPage.tsx`, `LabProcessPage.tsx`, `LabReviewPage.tsx`
- `frontend/src/pages/ArsipLokasiPage.tsx`, `ArsipMapPage.tsx`, `ArsipPinjamPage.tsx`, `ArsipHistoryPage.tsx`
- `frontend/src/api/workflows.ts` — adapter mock stateful
- `frontend/src/pages/ClinicalUi.tsx` — komponen UI bersama
- `frontend/src/components/navConfig.ts` dan `frontend/src/App.tsx` — menu dan routing terlindungi
- `frontend/src/data/mockData.ts` dan `frontend/src/pages/DemoRoleSelector.tsx` — role demo

## Verifikasi

Jalankan dari direktori `frontend`:

```bash
npm run build
```

Hasil verifikasi terakhir: `tsc -b` dan `vite build` berhasil.

## Integrasi Database Arsip

Entity TypeORM untuk `arsip_lokasi`, `arsip_map`, `arsip_pinjam`, dan `arsip_pinjam_detail` telah didaftarkan pada `AppModule`. `ArsipService` membaca data map, lokasi, dan riwayat dari repository PostgreSQL serta menjaga validasi transaksi pinjam/kembalikan. Endpoint yang tersedia adalah `GET /arsip/maps`, `GET/POST/PATCH/DELETE /arsip/lokasi`, `GET /arsip/riwayat`, dan `POST /arsip/maps/:id/pinjam|kembalikan`.

Frontend memakai endpoint tersebut saat `VITE_USE_MOCK=false`; mode mock tetap tersedia untuk demo tanpa database. Pemilihan role demo otomatis meminta token backend pada mode API, sehingga role `arsiparis / demo123` dapat membaca database dengan permission yang benar. Database lokal telah diverifikasi berisi 3 lokasi, 4 map, dan 1 transaksi peminjaman. Jalankan migration `backend/002_orangb_schema.sql` lalu seed `backend/003_orangb_seed.sql` pada instalasi baru sebelum memakai mode API.

## Berikutnya

Fase berikutnya dapat menghubungkan adapter mock ke API backend TASK-012, TASK-013, dan TASK-017.
