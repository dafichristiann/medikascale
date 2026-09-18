# MedikaScale — Frontend

React + TypeScript + Vite + Tailwind CSS. Dibangun untuk berjalan mandiri dengan **data mock**
lebih dulu, lalu tinggal disambungkan ke backend NestJS begitu API-nya siap.

## Menjalankan

```bash
npm install
cp .env.example .env
npm run dev
```

Buka `http://localhost:5173`. Login dengan salah satu akun demo (ditampilkan juga di halaman login):

| Username  | Password | Role            |
|-----------|----------|-----------------|
| dokter    | demo123  | Dokter          |
| perawat   | demo123  | Perawat         |
| apoteker  | demo123  | Apoteker        |
| lab       | demo123  | Lab & Radiologi |

## Struktur folder

```
src/
  api/          fungsi pemanggil backend NestJS (jatuh ke mock kalau VITE_USE_MOCK=true)
  components/   komponen UI reusable (Sidebar, Topbar, StatCard, Chip, navConfig)
  context/      AuthContext — state login & pengecekan permission RBAC
  data/         data mock (akun demo, antrian, arsip, resep, dst)
  layouts/      AppLayout — shell sidebar + topbar
  pages/        satu file per halaman/modul
  routes/       ProtectedRoute — guard berbasis login & permission
  types/        tipe TypeScript mengikuti skema database yang sudah disepakati
```

## Menyambungkan ke backend NestJS

1. Set `VITE_USE_MOCK=false` di `.env`.
2. Set `VITE_API_BASE_URL` ke alamat backend, misalnya `http://localhost:3000/api`.
3. Pastikan backend punya endpoint dengan kontrak yang sama seperti yang sudah
   ditulis di komentar tiap file `src/api/*.ts` — semuanya sudah didokumentasikan
   method, path, request, dan response yang diharapkan.
4. Response `POST /auth/login` **wajib** menyertakan `user.permissions` berupa
   array kode permission (hasil JOIN `role_permissions` + `permissions`), bukan
   cuma nama role — ini yang dipakai `AuthContext.hasPermission()` dan sidebar
   (`src/components/navConfig.ts`) untuk menentukan menu & tombol apa yang tampil.

## RBAC di sisi frontend

Sidebar dan tombol aksi (Prioritaskan, Ubah status, dst) **tidak** dicek berdasarkan
nama role, tapi berdasarkan `hasPermission('kode.permission')` dari `AuthContext`.
Ini sengaja meniru rancangan RBAC yang bisa diatur admin di backend — begitu admin
mengubah permission suatu role lewat panel admin, frontend otomatis ikut berubah
tanpa perlu deploy ulang, selama backend mengirim daftar permission yang benar
saat login.

**Catatan penting:** guard di frontend (`ProtectedRoute`, kondisi `hasPermission`)
hanya untuk pengalaman pengguna (menyembunyikan menu yang tidak relevan). Backend
NestJS **wajib** melakukan pengecekan permission yang sama di setiap endpoint —
jangan pernah mengandalkan frontend sebagai satu-satunya lapisan keamanan.

## Belum termasuk di tahap ini

- Chatbot WhatsApp (perlu backend + provider WA, lihat prompt modul Orang A)
- Perhitungan z-score WHO yang sesungguhnya (saat ini disimulasikan kasar di
  `src/api/klinis.ts` — beri komentar `TODO` jelas di kode)
- Panel Admin RBAC (Manajemen Role, Manajemen User, Matriks Hak Akses)
