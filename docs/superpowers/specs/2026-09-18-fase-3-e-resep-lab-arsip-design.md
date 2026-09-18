# Fase 3: E-Resep, Lab/Radiologi, dan Arsip Rekam Medis

## Tujuan

Menyediakan antarmuka operasional lengkap untuk tiga alur klinis: e-Resep, permintaan dan hasil Lab/Radiologi, serta pengelolaan arsip rekam medis. Implementasi awal berjalan dengan mock data stateful dan tetap memiliki batas API yang mudah dihubungkan ke endpoint backend final.

## Ruang lingkup

Fase ini mencakup halaman frontend dan routing untuk TASK-010 dan TASK-011. Tidak mencakup migrasi database, endpoint backend final, WebSocket, atau penghapusan data riwayat.

## Routing dan otorisasi

| Modul | Route | Akses |
| --- | --- | --- |
| E-Resep | `/resep/baru` | `resep.create` dan `resep.send` |
| E-Resep | `/resep` | `resep.view` atau `resep.process` |
| E-Resep | `/resep/:id` | `resep.view`; aksi bergantung permission |
| Pemeriksaan | `/pemeriksaan/permintaan` | `pemeriksaan.create` |
| Pemeriksaan | `/pemeriksaan` | `pemeriksaan.view` atau `pemeriksaan.process` |
| Pemeriksaan | `/pemeriksaan/:id/review` | `pemeriksaan.review` |
| Arsip | `/arsip/lokasi` | `arsip.manage` |
| Arsip | `/arsip/map` | `arsip.view` |
| Arsip | `/arsip/peminjaman` | `arsip.pinjam` atau `arsip.kembalikan` |
| Arsip | `/arsip/riwayat` | `arsip.view` |

`/lab` diarahkan ke daftar pemeriksaan. `/arsip` diarahkan ke pencarian map. `/resep` menjadi daftar resep untuk peran apoteker dan tetap hanya dapat diakses bila user memiliki salah satu permission pembacaan/pemrosesan resep. Semua route memakai `ProtectedRoute`.

## Halaman dan perilaku

### E-Resep

`ResepFormPage` memilih kunjungan dan memiliki baris obat dinamis berisi obat, dosis, jumlah, frekuensi, aturan pakai, serta instruksi. Form menyimpan sebagai `dibuat`, lalu mengirim sebagai `dikirim`; tombol kirim memvalidasi semua baris.

`ResepListPage` menyediakan pencarian dan filter status. `ResepDetailPage` menampilkan identitas pasien, daftar obat, kronologi status, dan hanya aksi yang valid bagi apoteker: `dikirim → diproses → siap → selesai`, atau pembatalan bila belum selesai. Dokter dapat membatalkan resep yang belum selesai sesuai permission.

### Lab dan Radiologi

`LabOrderPage` memilih kunjungan dan membentuk daftar pemeriksaan dinamis dengan kategori Lab atau Radiologi, nama pemeriksaan, dan catatan klinis. Permintaan dimulai sebagai `diminta`.

`LabProcessPage` menampilkan antrean pemeriksaan untuk petugas dan menerima proses/input hasil. Input hasil memuat nilai, satuan, nilai rujukan, serta interpretasi; status berubah dari `diminta` ke `diproses` lalu `hasil_siap`.

`LabReviewPage` memberi dokter detail hasil dan aksi setujui atau kembalikan untuk koreksi. Status review ditampilkan terpisah dari status proses agar hasil yang sudah siap tidak dianggap selesai sebelum ditinjau dokter.

### Arsip Rekam Medis

`ArsipLokasiPage` menyediakan CRUD lokasi dengan lantai, ruang, rak, dan baris. Lokasi yang masih dipakai map tidak dapat dihapus; UI menjelaskan alasannya.

`ArsipMapPage` melakukan pencarian dengan nomor RM, nomor map, nama pasien, atau lokasi. Hasil menampilkan alamat fisik lengkap dan status ketersediaan.

`ArsipPinjamPage` memuat modal pinjam/kembalikan. Keterangan wajib pada kedua tindakan. Alur memperbarui status map dari `tersedia` ke `dipinjam`, lalu ke `dikembalikan`/`tersedia` setelah pengembalian.

`ArsipHistoryPage` hanya menampilkan riwayat peminjaman. Tidak ada aksi hapus, dan setiap transaksi baru ditambahkan sebagai entri baru.

## Data dan batas integrasi

Tipe domain dan adapter API diperluas di frontend. Pada mode mock, adapter menyimpan perubahan di memori sehingga daftar, detail, status, dan riwayat langsung konsisten selama sesi. Dalam mode API, adapter memanggil endpoint dengan kontrak yang sama. Tidak ada logika bisnis penting yang hanya diterapkan di komponen tampilan.

## Umpan balik dan kegagalan

Komponen halaman menjaga status loading dan error. Tombol aksi dinonaktifkan selama request berjalan. Kesalahan validasi ditampilkan dekat field terkait; kegagalan API ditampilkan sebagai pesan ringkas tanpa menghapus data form. Keberhasilan tindakan diberi konfirmasi ringkas.

## Verifikasi

1. `npm run build` pada frontend harus lulus.
2. Setiap route dapat dibuka oleh role berizin dan ditolak oleh role tanpa permission.
3. Form resep dan pemeriksaan tidak dapat dikirim dengan baris kosong.
4. Perpindahan status hanya menawarkan transisi yang valid.
5. Pinjam/kembalikan mengharuskan keterangan dan menambah riwayat tanpa menghapus entri lama.
