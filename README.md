<div align="center">

<img src="public/img/logo_smp-informatika-bina-generasi.png" alt="Logo SMP Informatika Bina Generasi" width="160"/>

# Sistem Informasi Perpustakaan Digital
### SMP Informatika Bina Generasi Bogor

<br/>

[![Built by fidhera](https://img.shields.io/badge/Built%20by-fidhera-E50914?style=for-the-badge&logo=github)](https://github.com/fidhera)
[![Instagram](https://img.shields.io/badge/Instagram-Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white)](https://instagram.com/fidhera)
[![Discord](https://img.shields.io/badge/Discord-Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/cPbJn86jM)
[![License](https://img.shields.io/badge/License-MIT-F59E0B?style=for-the-badge)](LICENSE)

<br/>

[![Node.js Version](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Framework](https://img.shields.io/badge/Framework-Express%205-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![ORM](https://img.shields.io/badge/ORM-Sequelize-52B0E7?style=for-the-badge&logo=sequelize&logoColor=white)](https://sequelize.org/)
[![Database](https://img.shields.io/badge/Database-MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Authentication](https://img.shields.io/badge/Auth-JWT%20%7C%20Bcrypt-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white)](https://jwt.io/)
[![Uploads](https://img.shields.io/badge/File%20Upload-Multer-FF6F00?style=for-the-badge)](https://github.com/expressjs/multer)
[![Frontend](https://img.shields.io/badge/Architecture-Vanilla%20JS%20SPA-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Analytics](https://img.shields.io/badge/Analytics-Chart.js-FF6384?style=for-the-badge&logo=chart.js&logoColor=white)](https://www.chartjs.org/)
[![Icons](https://img.shields.io/badge/Icons-Font%20Awesome%206-528DD7?style=for-the-badge&logo=font-awesome&logoColor=white)](https://fontawesome.com/)

<br/>

Aplikasi web pengelolaan perpustakaan sekolah berbasis Single Page Application (SPA). Sistem ini mencakup katalog buku, peminjaman mandiri oleh siswa, pelacakan kondisi fisik tiap eksemplar, perhitungan denda, serta rekapitulasi data untuk pihak sekolah.

---

[Deskripsi](#deskripsi) • [Pembaruan Fitur Terbaru](#pembaruan-fitur-terbaru) • [Fitur Utama](#fitur-utama) • [Hak Akses Pengguna](#hak-akses-pengguna) • [Alur Kerja Sistem](#alur-kerja-sistem) • [Denda dan Kondisi Buku](#denda-dan-kondisi-buku) • [Panduan Instalasi](#panduan-instalasi) • [Struktur Direktori](#struktur-direktori) • [Pengembang](#pengembang)
</div>

---

## Deskripsi

Sistem ini dibuat untuk menggantikan pencatatan manual di perpustakaan sekolah yang sering mengalami kendala selisih stok, hilangnya riwayat kondisi fisik buku, dan antrean saat peminjaman.

Fokus utama aplikasi ini:
1. Peminjaman mandiri oleh siswa melalui katalog daring sebelum mengambil buku di ruang baca.
2. Pelacakan per eksemplar fisik dengan kode unik (misal: `BK-001-001`) beserta riwayat kondisi fisik (Baik, Rusak Ringan, Rusak Berat, Hilang).
3. Penyesuaian stok otomatis saat buku disetujui, diambil, dan dikembalikan, lengkap dengan kalkulasi denda jika ada kerusakan atau keterlambatan.
4. Verifikasi akun awal bagi siswa baru untuk melengkapi data kelas, email, dan mengganti password bawaan.
5. Pengaturan konten halaman beranda sekolah langsung dari dashboard admin.

---

## Pembaruan Fitur Terbaru

Berikut rincian pembaruan yang baru saja diselesaikan pada sistem:

### Tiket Digital dan Kode Booking Otomatis
- Penambahan kode booking unik berformat `BK-YYYYMMDD-XXXX` (misal: `BK-20261027-4821`) pada model database dan endpoint peminjaman.
- Halaman bukti peminjaman yang disetujui menampilkan tiket digital berisi nama siswa, NISN, kelas, kode booking, batas pengembalian, serta tombol cetak bukti fisik.
- Siswa dapat memfilter riwayat peminjaman berdasarkan status (Menunggu Persetujuan, Sedang Dipinjam, Selesai, Ditolak) atau membatalkan permohonan yang belum diverifikasi.

### Modal Peminjaman dan Hitung Batas Waktu
- Modal booking di katalog menampilkan pratinjau buku, lokasi rak, dan sisa stok.
- Sistem otomatis menghitung batas pengembalian buku 7 hari ke depan begitu tanggal rencana pengambilan dipilih.

### Tampilan Dashboard Siswa
- Menampilkan rekomendasi buku terbaru dan terpopuler di halaman dashboard siswa.
- Kartu pengingat jatuh tempo yang menghitung sisa hari peminjaman atau menandai status terlambat jika melewati batas waktu.

### Penyimpanan CMS Beranda ke Basis Data
- Tabel `landing_settings` ditambahkan ke basis data MySQL agar perubahan teks banner, kartu informasi, kontak, dan statistik beranda tersimpan permanen.
- Endpoint `GET` dan `PUT` pada `/api/landing/settings` diselaraskan agar data beranda langsung sinkron dengan editor admin.

### Keamanan dan Tampilan
- Penambahan fungsi pembersih teks untuk mencegah celah keamanan XSS pada data yang dimasukkan pengguna.
- Perapian tampilan kartu katalog, tiket peminjaman, serta penyesuaian tata letak agar nyaman dibuka lewat layar ponsel.

---

## Fitur Utama

### 1. Halaman Beranda dan Editor CMS
- Bilah pencarian cepat untuk mencari buku berdasarkan judul, pengarang, materi pelajaran, atau ISBN.
- Kartu informasi seputar koleksi pelajaran kelas VII, VIII, IX, dan buku sekolah digital.
- Panel admin untuk mengubah teks sambutan, informasi layanan, dan kontak perpustakaan tanpa perlu menyentuh kode program.

### 2. Katalog Buku
- Filter buku berdasarkan kategori atau genre, status ketersediaan, dan kondisi fisik.
- Informasi detail buku mencakup pengarang, penerbit, nomor rak di ruang baca, dan jumlah stok yang tersedia.

### 3. Sirkulasi Peminjaman
- Siswa dapat mengajukan peminjaman hingga 2 buku aktif sekaligus.
- Petugas memeriksa permohonan (menyetujui atau menolak disertai alasan).
- Alokasi kode eksemplar fisik otomatis saat buku diserahkan ke siswa.
- Pengembalian buku mencatat tanggal kembali, kondisi fisik buku, dan penyesuaian stok kembali.

### 4. Pelacakan Kondisi Buku
- Pencatatan nomor eksemplar unik untuk setiap buku fisik.
- Grafik donat kondisi fisik buku (Baik, Rusak Ringan, Rusak Berat, Hilang).
- Catatan detail riwayat kerusakan buku beserta nama petugas yang memeriksa.

### 5. Pengelolaan Data Buku dan Kategori
- Form tambah dan ubah data buku, unggah sampul buku, dan sinkronisasi jumlah eksemplar.
- Penonaktifan buku tanpa menghapus histori peminjaman lama.
- Pengelompokan koleksi ke dalam kategori tematik seperti Pendidikan, Fiksi, Teknologi, dan Sejarah.

### 6. Pengelolaan Pengguna
- Autentikasi berbasis JWT dengan enkripsi kata sandi menggunakan bcrypt.
- Alur login pertama bagi siswa untuk memperbarui identitas dan mengganti kata sandi bawaan.
- Menu admin untuk menambah, mencari, mengatur hak akses, atau menonaktifkan akun.

### 7. Laporan dan Statistik
- Ringkasan total judul, buku dipinjam, buku tersedia, dan peminjaman tertunda.
- Grafik pertumbuhan koleksi buku per bulan dan daftar buku paling sering dipinjam.
- Filter laporan berdasarkan rentang tanggal untuk kebutuhan arsip dan cetak.

---

## Hak Akses Pengguna

| Modul / Fitur | Administrator | Pimpinan Sekolah | Siswa |
|---|:---:|:---:|:---:|
| Akses Beranda & Katalog Publik | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| Pengajuan Booking Buku Mandiri | :x: | :x: | :white_check_mark: |
| Riwayat Peminjaman Pribadi & Notifikasi | :x: | :x: | :white_check_mark: |
| Pengaturan Profil & Ganti Password | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| Verifikasi Permohonan Booking | :white_check_mark: | :x: | :x: |
| Konfirmasi Pengambilan & Pengembalian | :white_check_mark: | :x: | :x: |
| Kelola Data Buku & Unggah Sampul | :white_check_mark: | :x: | :x: |
| Kelola Eksemplar & Kondisi Buku | :white_check_mark: | :white_check_mark: *(Lihat)* | :x: |
| Kelola Kategori Buku | :white_check_mark: | :x: | :x: |
| Kelola Akun Pengguna | :white_check_mark: | :x: | :x: |
| Editor CMS Beranda | :white_check_mark: | :x: | :x: |
| Akses Dashboard Statistik | :white_check_mark: | :white_check_mark: | :x: |
| Cetak Laporan Sirkulasi | :white_check_mark: | :white_check_mark: | :x: |

---

## Alur Kerja Sistem

```text
[Siswa Memilih Buku di Katalog]
           │
           ▼
[Ajukan Peminjaman (Maksimal 2 Buku)]
           │
           ▼
[Status: Menunggu Persetujuan] ───────────────┐
           │                                   │
           ▼                                   ▼
[Petugas Menyetujui]                  [Petugas Menolak]
           │                                   │
           ▼                                   ▼
[Status: Disetujui]                   [Status: Ditolak]
           │                          (Siswa mendapat alasan penolakan)
           ▼
[Siswa Mengambil Buku di Perpustakaan]
           │
           ▼
[Petugas Mengonfirmasi Pengambilan] ──> Sistem mencatat kode eksemplar
           │                            dan mengurangi stok buku (-1)
           ▼
[Status: Sedang Dipinjam]
(Batas Waktu: 7 Hari)
           │
           ├─── (Melewati batas) ───> [Status: Terlambat]
           │
           ▼
[Siswa Mengembalikan Buku]
           │
           ▼
[Pemeriksaan Kondisi Buku]
           │
           ├── Baik: Denda Rp 0
           ├── Rusak Ringan: Denda Rp 10.000
           ├── Rusak Berat: Denda Rp 25.000
           └── Hilang: Denda Rp 50.000 (stok tidak ditambah)
           │
           ▼
[Status: Dikembalikan] ───────────────> Stok buku ditambah kembali (+1)
```

---

## Denda dan Kondisi Buku

Penetapan denda dilakukan saat buku dikembalikan berdasarkan kondisi fisik eksemplar:

| Kondisi Buku | Status Eksemplar | Besaran Denda | Keterangan |
|---|---|---|---|
| **Baik** | `tersedia` | Rp 0 | Stok buku bertambah (+1) dan siap dipinjamkan kembali. |
| **Rusak Ringan** | `tersedia` | Rp 10.000 | Catatan kerusakan disimpan, stok bertambah (+1) untuk diperbaiki. |
| **Rusak Berat** | `tersedia` | Rp 25.000 | Kerusakan dicatat pada eksemplar, stok bertambah (+1). |
| **Hilang** | `hilang` | Rp 50.000 | Status eksemplar diubah menjadi hilang dan stok tidak dikembalikan. |

---

## Panduan Instalasi

### Kebutuhan Sistem

- Node.js versi 18 atau lebih baru
- NPM
- Server MySQL (Laragon, XAMPP, atau MySQL mandiri)
- Git
- Web browser modern

---

### Langkah Menjalankan Aplikasi

1. **Kloning Repositori**
   ```bash
   git clone https://github.com/fidhera/pppl-perpustakaan.git
   cd perpustakaan
   ```

2. **Siapkan Basis Data**
   - Buka MySQL melalui Laragon atau XAMPP.
   - Buat database baru bernama `perpustakaan`:
     ```sql
     CREATE DATABASE perpustakaan;
     ```
   - Impor berkas struktur dan data awal:
     ```text
     perpustakaan.sql
     ```

3. **Konfigurasi Berkas `.env`**
   Pastikan terdapat berkas `.env` di folder utama:
   ```env
   PORT=3000
   NODE_ENV=development

   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=perpustakaan
   DB_USER=root
   DB_PASSWORD=

   JWT_SECRET=perpustakaan_secret_key_2024_sangat_rahasia
   JWT_EXPIRES_IN=24h

   UPLOAD_DIR=uploads
   MAX_FILE_SIZE=5242880
   ```

4. **Pasang Dependensi**
   ```bash
   npm install
   ```

5. **Jalankan Aplikasi**
   Untuk mode pengembangan:
   ```bash
   npm run dev
   ```
   Atau mode standar:
   ```bash
   npm start
   ```

6. **Buka Aplikasi di Browser**
   Buka alamat berikut di browser:
   ```text
   http://localhost:3000
   ```

---

## Struktur Direktori

```text
perpustakaan/
├── config/
│   └── database.js            # Koneksi MySQL via Sequelize
├── middleware/
│   ├── auth.js                # Verifikasi token JWT dan hak akses
│   └── upload.js              # Pengaturan upload gambar sampul dan foto profil
├── models/
│   ├── Book.js                # Data buku
│   ├── BookCopy.js            # Data eksemplar fisik buku
│   ├── Booking.js             # Data transaksi peminjaman
│   ├── Category.js            # Kategori buku
│   ├── LandingSetting.js      # Pengaturan konten beranda
│   ├── Notification.js        # Data notifikasi pengguna
│   ├── Return.js              # Data pengembalian dan denda
│   ├── User.js                # Data pengguna
│   └── index.js               # Relasi antar tabel
├── routes/
│   ├── auth.js                # Rute login dan autentikasi
│   ├── books.js               # Rute kelola dan pencarian buku
│   ├── bookings.js            # Rute proses peminjaman buku
│   ├── categories.js          # Rute kategori buku
│   ├── landing.js             # Rute konten beranda
│   ├── notifications.js       # Rute notifikasi
│   ├── reports.js             # Rute laporan dan analitik
│   └── users.js               # Rute pengguna dan profil
├── public/
│   ├── css/
│   │   └── style.css          # Gaya antarmuka sistem
│   ├── img/                   # Gambar latar dan logo sekolah
│   ├── js/
│   │   ├── api.js             # Modul pemanggilan API backend
│   │   ├── app.js             # Inisialisasi aplikasi SPA
│   │   ├── auth.js            # Manajemen status login pengguna
│   │   ├── components.js      # Komponen navbar, modal, dan pesan
│   │   ├── router.js          # Pengatur rute halaman
│   │   └── pages/             # Logika tampilan masing-masing halaman
│   └── index.html             # Berkas HTML utama aplikasi
├── uploads/                   # Direktori berkas sampul dan foto profil
├── perpustakaan.sql           # Skrip basis data awal
└── server.js                  # Titik masuk server Express
```

---

## Pengembang
Dikembangkan oleh: [Raffael Fidhera](https://instagram.com/fidhera)
