# Fase 2: Sidebar dan Modul Klinik & Tumbuh Kembang

**Status:** Selesai  
**Tanggal:** 2026-09-18  
**Rujukan:** TASK-008 / ISSUE-008

## Ruang Lingkup

Fase ini menambahkan akses navigasi dan halaman placeholder untuk lima modul klinik. Belum ada form, integrasi API, atau penyimpanan data klinis di dalam fase ini.

## Implementasi

Sidebar memiliki kelompok **Klinik & Tumbuh Kembang**. Item di dalamnya hanya ditampilkan jika pengguna memiliki permission yang sesuai. Rute juga dilindungi dengan `ProtectedRoute`, sehingga pengguna yang menebak URL tanpa hak akses akan diarahkan ke halaman 403.

| Modul | Rute | Permission | Ikon |
|---|---|---|---|
| SOPHI | `/sophi` | `sophi.view` | `Brain` |
| Vaksin | `/vaksin` | `vaksin.view` | `Shield` |
| Konsultasi Tumbuh Kembang | `/tumbuh-kembang` | `tumbuh_kembang.view` | `TrendingUp` |
| Denver II | `/denver-ii` | `denver_ii.view` | `Activity` |
| Konsultasi Makan | `/konsultasi-makan` | `konsultasi_makan.view` | `Utensils` |

Kelima halaman menggunakan komponen placeholder bersama agar tampilan, pesan status, dan gaya antarmuka konsisten.

### Pemilihan role demo tanpa password

Rute `/demo-role` menyediakan kartu untuk Dokter, Perawat, Apoteker, Lab & Radiologi, dan Arsiparis. Menekan kartu menyimpan profil demo yang dipilih pada penyimpanan browser kemudian membuka dashboard, tanpa username atau password. `ProtectedRoute` dan pemeriksaan permission tidak dihapus; sidebar dan rute menyesuaikan daftar permission role yang dipilih.

Tombol **Ganti role** membersihkan sesi tersimpan dan membuka kembali pemilih role. Pengguna tanpa sesi yang membuka rute terlindungi juga akan diarahkan ke `/demo-role`.

## File Terkait

- `frontend/src/components/navConfig.ts` — konfigurasi menu dan permission.
- `frontend/src/components/Sidebar.tsx` — pengelompokan dan tampilan menu yang diizinkan.
- `frontend/src/App.tsx` — lima rute baru beserta guard permission.
- `frontend/src/pages/DemoRoleSelector.tsx` — pemilih role demo tanpa password.
- `frontend/src/context/AuthContext.tsx` — penyimpanan dan pemulihan profil demo terpilih.
- `frontend/src/pages/KlinikModulePlaceholder.tsx` — komponen placeholder bersama.
- `frontend/src/pages/{Sophi,Vaksin,TumbuhKembang,DenverIi,KonsultasiMakan}.tsx` — halaman masing-masing modul.

## Verifikasi

Jalankan dari direktori `frontend`:

```bash
npm run build
```

Verifikasi manual: masuk sebagai pengguna yang memiliki permission modul, pastikan menu dan halaman muncul. Masuk sebagai pengguna tanpa permission atau akses URL langsung harus menghasilkan halaman 403.
