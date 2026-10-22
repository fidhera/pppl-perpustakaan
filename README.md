<div align="center">

<img src="public/img/logo_smp-informatika-bina-generasi.png" alt="Logo SMP Informatika Bina Generasi" width="160"/>

# Sistem Informasi Perpustakaan Digital
### SMP Informatika Bina Generasi Bogor

<br/>

<!-- Identity & Community -->
[![Built by fidhera](https://img.shields.io/badge/Built%20by-fidhera-E50914?style=for-the-badge&logo=github)](https://github.com/fidhera)
[![Instagram](https://img.shields.io/badge/Instagram-Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white)](https://instagram.com/fidhera)
[![Discord](https://img.shields.io/badge/Discord-Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/cPbJn86jM)
[![License](https://img.shields.io/badge/License-MIT-F59E0B?style=for-the-badge)](LICENSE)

<br/>

<!-- Backend & Core Tech Stack -->
[![Node.js Version](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Framework](https://img.shields.io/badge/Framework-Express%205-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![ORM](https://img.shields.io/badge/ORM-Sequelize-52B0E7?style=for-the-badge&logo=sequelize&logoColor=white)](https://sequelize.org/)
[![Database](https://img.shields.io/badge/Database-MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)

<!-- Security & Utilities -->
[![Authentication](https://img.shields.io/badge/Auth-JWT%20%7C%20Bcrypt-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white)](https://jwt.io/)
[![Uploads](https://img.shields.io/badge/File%20Upload-Multer-FF6F00?style=for-the-badge)](https://github.com/expressjs/multer)

<!-- Frontend & Visualization -->
[![Frontend](https://img.shields.io/badge/Architecture-Vanilla%20JS%20SPA-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Analytics](https://img.shields.io/badge/Analytics-Chart.js-FF6384?style=for-the-badge&logo=chart.js&logoColor=white)](https://www.chartjs.org/)
[![Icons](https://img.shields.io/badge/Icons-Font%20Awesome%206-528DD7?style=for-the-badge&logo=font-awesome&logoColor=white)](https://fontawesome.com/)

<br/>

**Sistem Informasi Perpustakaan Digital SMP Informatika Bina Generasi** adalah platform otomasi perpustakaan sekolah modern berbasis web *Single Page Application* (SPA). Sistem ini mengintegrasikan katalog literasi sekolah, otomasi sirkulasi peminjaman & *booking* buku mandiri bagi siswa, pelacakan kondisi fisik buku per eksemplar fisik (*item-level tracking*), kalkulasi denda otomatis, hingga panel laporan analitik interaktif bagi pimpinan dan pengelola perpustakaan.

---

[Deskripsi](#deskripsi) • [Fitur Utama](#fitur-utama) • [Hak Akses Pengguna](#hak-akses-pengguna) • [Alur Kerja Sistem](#alur-kerja-sistem) • [Mekanisme Denda dan Kondisi Buku](#mekanisme-denda-dan-kondisi-buku) • [Memulai](#memulai) • [Direktori](#direktori) • [Penulis](#penulis)
</div>

---

## Deskripsi

Pengelolaan perpustakaan sekolah konvensional umumnya menghadapi kendala pencatatan manual buku yang rentan selisih stok, tidak adanya pelacakan kondisi fisik setiap eksemplar buku yang dipinjam, antrean panjang peminjaman, serta penyusunan rekapitulasi laporan yang memakan waktu.

**Sistem Perpustakaan SMP Informatika Bina Generasi** mengatasi berbagai kendala tersebut melalui integrasi sistem digital terpadu:
1. **Otomasi Sirkulasi Mandiri (Self-Booking):** Siswa dapat menelusuri katalog secara daring dari rumah maupun gawai pribadi dan melakukan *booking* buku sebelum mengambilnya di meja sirkulasi.
2. **Pelacakan Eksemplar Fisik (*Book Copy Tracking*):** Setiap buku fisik memiliki kode eksemplar unik (contoh: `BK-001-001`) dengan pencatatan riwayat kondisi fisik (*Baik*, *Rusak Ringan*, *Rusak Berat*, *Hilang*) dan petugas pemeriksa yang bertanggung jawab.
3. **Penyelarasan Stok Dinamis & Penalti Denda:** Stok buku tersinkronisasi otomatis saat disetujui, diambil, dan dikembalikan. Sistem secara otomatis menghitung estimasi denda berdasarkan tingkat kerusakan buku saat proses *check-in*.
4. **Onboarding & Keamanan Akun Berlapis:** Siswa diarahkan melalui alur *first-time sign in* untuk mengonfirmasi NISN, kelas, melengkapi email, dan memperbarui kata sandi awal sebelum mengakses katalog penuh.
5. **CMS Beranda Terbuka & Laporan Analitik:** Halaman depan publik dapat dikustomisasi langsung oleh admin (*CMS Landing Editor*) untuk menginformasikan layanan kurikulum merdeka, jam operasional, serta statistik real-time koleksi bagi Pimpinan Sekolah.

---

## Fitur Utama

### 1. Landing Page Publik & Editor CMS (`/beranda` & `/kelola-beranda`)
- **Hero & Search Box Cerdas:** Banner informasi resmi sekolah dengan bilah pencarian instan berdasarkan judul, pengarang, materi pelajaran, atau ISBN.
- **Koleksi Unggulan & Layanan Kurikulum Merdeka:** Kartu etalase buku paket kelas VII, VIII, IX, BSE Kemendikbud, publikasi prestasi siswa, dan ensiklopedia sains.
- **CMS Editor Terintegrasi:** Admin dapat memperbarui teks *hero*, kartu layanan, kontak perpustakaan, dan informasi sekolah secara dinamis tanpa mengubah baris kode.

### 2. Katalog Buku & Pencarian Real-Time (`/katalog` & `/layanan`)
- **Pencarian Multifaset:** Filter cepat berdasarkan kategori/genre, status ketersediaan (*Tersedia/Dipinjam/Habis*), kondisi buku, dan kata kunci.
- **Informasi Lokasi Rak & Metadata Lengkap:** Menampilkan penerbit, tahun terbit, ISBN, deskripsi ringkas, letak rak fisik di ruang baca, dan kuota stok aktif.

### 3. Sirkulasi Peminjaman & Booking Siswa (`/peminjaman` & `/peminjaman-saya`)
- **Pemesanan Mandiri Siswa (Self-Booking):** Siswa dapat membooking buku dengan batas maksimal 2 buku aktif sekaligus dan menentukan tanggal rencana pengambilan.
- **Approval Workflow Admin:** Admin dapat memverifikasi permohonan (*Setujui* atau *Tolak* disertai alasan penolakan).
- **Pengambilan Buku Fisik (Pickup):** Penugasan eksemplar fisik buku secara otomatis (`BookCopy`) dan pengurangan stok tersedia saat buku diserahkan ke siswa.
- **Pengembalian Buku (Return):** Pencatatan tanggal pengembalian, verifikasi kondisi fisik buku, dan penyesuaian otomatis stok buku.
- **Penanganan Keterlambatan (Overdue):** Penandaan status terlambat bagi peminjam yang melewati batas durasi pinjam (default: 7 hari).

### 4. Manajemen Kondisi Buku Per Eksemplar (`/kondisi-buku`)
- **Pelacakan Fisik Eksemplar Unik:** Mengelola inventaris detail setiap eksemplar buku dengan kode unik.
- **Visualisasi Chart.js Donut:** Grafik interaktif distribusi kondisi buku (*Baik*, *Rusak Ringan*, *Rusak Berat*, *Hilang*).
- **Audit Kondisi:** Catatan detail kerusakan buku beserta nama staf pemeriksa (*condition_updated_by*).

### 5. Manajemen Koleksi & Kategori (`/kelola-buku` & `/kategori`)
- **CRUD Buku Terpusat:** Penambahan buku baru, penyuntingan data buku, unggah *cover image* dengan Multer, serta sinkronisasi otomatis stok terhadap jumlah eksemplar.
- **Pengarsipan Aman (Soft Delete):** Menonaktifkan buku tanpa menghapus histori peminjaman lampau (`is_active: false`).
- **Kelola Kategori/Genre:** Pengelompokan buku ke dalam kategori tematik (Sains, Fiksi, Bahasa, Teknologi, Sejarah, dsb).

### 6. Manajemen Pengguna & First-Time Onboarding (`/manajemen-user` & `/lengkapi-akun`)
- **Autentikasi Aman:** Berbasis JWT (*JSON Web Token*) dengan enkripsi kata sandi menggunakan `bcryptjs`.
- **First-Login Wizard:** Siswa yang baru dibuatkan akun oleh admin diwajibkan melengkapi nama, email, kelas, dan mengganti kata sandi bawaan pada saat login pertama.
- **Admin User Management:** Admin dapat membuat akun pengguna baru, mencari data pengguna, mengatur role (*admin, pimpinan, siswa*), serta menonaktifkan akun.

### 7. Laporan & Dashboard Analitik (`/dashboard` & `/laporan`)
- **Ringkasan Metrik Cepat:** Total judul buku, buku tersedia, buku sedang dipinjam, peminjaman aktif, peminjaman tertunda, dan buku yang ditambahkan bulan ini.
- **Analisis Tren Koleksi:** Grafik pertumbuhan koleksi dan tren peminjaman buku.
- **Buku Terpopuler:** Daftar 10 buku yang paling sering dipinjam oleh para siswa.
- **Filter Periode Laporan:** Filter data laporan berdasarkan tahun, bulan, atau rentang tanggal tertentu yang siap dicetak (*print-ready view*).

### 8. Sistem Notifikasi Internal (`/api/notifications`)
- Notifikasi terkirim otomatis ke akun siswa saat pengajuan booking disetujui, ditolak, buku berhasil diambil, buku dikembalikan, atau jika masa pinjam terlewat.

---

## Hak Akses Pengguna

Sistem menerapkan prinsip *Role-Based Access Control* (RBAC) dengan 3 level kewenangan:

| Modul / Fitur | Administrator | Pimpinan Sekolah | Siswa |
|---|:---:|:---:|:---:|
| Akses Landing Page & Katalog Publik | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| Melakukan Booking Buku Mandiri | :x: | :x: | :white_check_mark: |
| Riwayat Peminjaman Pribadi & Notifikasi | :x: | :x: | :white_check_mark: |
| Pengaturan Profil & First Login Setup | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| Persetujuan / Penolakan Booking | :white_check_mark: | :x: | :x: |
| Konfirmasi Pengambilan & Pengembalian Buku | :white_check_mark: | :x: | :x: |
| Manajemen Data Buku & Unggah Cover | :white_check_mark: | :x: | :x: |
| Manajemen Eksemplar & Kondisi Buku | :white_check_mark: | :white_check_mark: *(View)* | :x: |
| Manajemen Kategori Buku | :white_check_mark: | :x: | :x: |
| Manajemen Pengguna (Siswa/Staf) | :white_check_mark: | :x: | :x: |
| Editor CMS Beranda (Landing Page) | :white_check_mark: | :x: | :x: |
| Akses Dashboard Statistik Perpustakaan | :white_check_mark: | :white_check_mark: | :x: |
| Akses & Cetak Laporan Sirkulasi Lengkap | :white_check_mark: | :white_check_mark: | :x: |

---

## Alur Kerja Sistem

```text
[Siswa: Telusuri Katalog]
           │
           ▼
[Pilih Buku & Ajukan Booking (Maks. 2 Buku)]
           │
           ▼
[Status: PENDING] ──────────────────────────┐
           │                                │
           ▼                                ▼
[Admin: Review Permohonan]         [Admin: Tolak Permohonan]
           │                                │
           ▼                                ▼
[Status: DISETUJUI]                [Status: DITOLAK]
           │                       (Siswa menerima notifikasi & alasan)
           ▼
[Siswa Datang ke Perpustakaan]
           │
           ▼
[Admin Konfirmasi Pengambilan (Pickup)] ──> Sistem mengalokasikan kode eksemplar fisik
           │                                & mengurangi stok tersedia (-1)
           ▼
[Status: DIAMBIL / AKTIF DIPINJAM]
(Durasi Pinjam: 7 Hari)
           │
           ├─── (Jika melewati batas) ───> [Status: TERLAMBAT] (Notifikasi Peringatan)
           │
           ▼
[Siswa Mengembalikan Buku]
           │
           ▼
[Admin Inspeksi Kondisi Fisik Eksemplar]
           │
           ├── Kondisi: Baik (Denda: Rp 0)
           ├── Kondisi: Rusak Ringan (Denda: Rp 10.000)
           ├── Kondisi: Rusak Berat (Denda: Rp 25.000)
           └── Kondisi: Hilang (Denda: Rp 50.000, stok tidak dikembalikan)
           │
           ▼
[Status: DIKEMBALIKAN] ───────────────────> Stok buku otomatis dikembalikan (+1)*
                                            Data tercatat di riwayat & laporan
```

---

## Mekanisme Denda dan Kondisi Buku

Untuk menjaga kualitas dan integritas inventaris koleksi buku sekolah, sistem menerapkan aturan penilaian kondisi fisik dan penetapan denda otomatis saat proses pengembalian (*check-in*):

| Kondisi Buku | Status Eksemplar | Besaran Denda | Tindakan Sistem |
|---|---|---|---|
| **Baik** | `tersedia` | **Rp 0** | Stok buku bertambah (+1). Eksemplar siap dipinjamkan kembali. |
| **Rusak Ringan** | `tersedia` | **Rp 10.000** | Catatan kerusakan disimpan, stok bertambah (+1) untuk penanganan/perbaikan ringan. |
| **Rusak Berat** | `tersedia` | **Rp 25.000** | Catatan kerusakan berat dicatat dalam riwayat eksemplar, stok buku bertambah (+1). |
| **Hilang** | `hilang` | **Rp 50.000** | Status eksemplar diubah menjadi hilang, stok buku **tidak dikembalikan** ke peredaran. |

---

## Memulai
Panduan Instalasi dan Menjalankan Program di Lingkungan Lokal.

### Prasyarat Perangkat Lunak

Pastikan perangkat berikut telah terpasang di komputer Anda:

- **Node.js**: Versi 18.x atau yang lebih baru (disarankan LTS)
- **NPM**: Bawaan dari Node.js
- **MySQL Database Server**: Laragon / XAMPP / MySQL Community Server
- **Git**
- Peramban web modern (Google Chrome, Mozilla Firefox, Microsoft Edge, dll)

---

### Panduan Instalasi dan Menjalankan Program

Ikuti langkah-langkah berikut secara berurutan untuk menjalankan proyek di lingkungan komputer lokal.

### 1. Kloning Repositori

Buka Terminal / Command Prompt / PowerShell, lalu jalankan:

```bash
git clone https://github.com/fidhera/perpustakaan.git
cd perpustakaan
```

### 2. Konfigurasi Basis Data (Database MySQL)

1. Jalankan layanan MySQL melalui panel **Laragon** atau **XAMPP**.
2. Buka antarmuka manajemen basis data (phpMyAdmin, HeidiSQL, atau DBeaver).
3. Buat database baru dengan nama:
   ```sql
   CREATE DATABASE perpustakaan;
   ```
4. Impor berkas struktur dan data awal yang telah disediakan:
   ```text
   perpustakaan.sql
   ```

### 3. Konfigurasi Environment Variable (`.env`)

Pastikan terdapat berkas `.env` di direktori utama proyek. Anda dapat menyesuaikan pengaturannya sebagai berikut:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration (MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=perpustakaan
DB_USER=root
DB_PASSWORD=

# JWT Configuration
JWT_SECRET=perpustakaan_secret_key_2024_sangat_rahasia
JWT_EXPIRES_IN=24h

# Upload Configuration
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
```

### 4. Memasang Dependensi Pustaka

Jalankan perintah instalasi paket modul Node.js:

```bash
npm install
```

### 5. Menjalankan Aplikasi

Jalankan server dalam mode pengembangan (*development mode* dengan auto-reload):

```bash
npm run dev
```

Atau jalankan dalam mode standar:

```bash
npm start
```

Setelah server aktif, terminal akan menampilkan konfirmasi:

```text
Database connected successfully.
Server running on port 3000
http://localhost:3000
```

### 6. Mengakses Antarmuka Sistem

Buka peramban web dan akses alamat:

```text
http://localhost:3000
```

---

## Direktori

```text
perpustakaan/
│
├── config/
│   └── database.js            # Konfigurasi koneksi MySQL via Sequelize ORM
│
├── middleware/
│   ├── auth.js                # Middleware verifikasi token JWT & Role-Based Access
│   └── upload.js              # Konfigurasi Multer untuk penyimpanan berkas cover & avatar
│
├── models/
│   ├── Book.js                # Model data buku utama (judul, pengarang, stok, rak)
│   ├── BookCopy.js            # Model data eksemplar fisik buku & kondisi
│   ├── Booking.js             # Model transaksi booking & sirkulasi peminjaman
│   ├── Category.js            # Model kategori / genre buku
│   ├── LandingSetting.js      # Model penyimpanan konfigurasi CMS landing page
│   ├── Notification.js        # Model notifikasi pengguna
│   ├── Return.js              # Model pengembalian buku, denda, & status kondisi
│   ├── User.js                # Model pengguna (admin, pimpinan, siswa)
│   └── index.js               # Pengaturan relasi antar model (Associations)
│
├── routes/
│   ├── auth.js                # Endpoint login, registrasi siswa, & autentikasi
│   ├── books.js               # Endpoint CRUD buku, pencarian, & inventaris eksemplar
│   ├── bookings.js            # Endpoint sirkulasi (booking, approve, pickup, return)
│   ├── categories.js          # Endpoint pengelolaan kategori buku
│   ├── landing.js             # Endpoint CMS konten dan data landing page
│   ├── notifications.js       # Endpoint notifikasi pengguna
│   ├── reports.js             # Endpoint analitik, buku populer, & statistik dashboard
│   └── users.js               # Endpoint manajemen profil, onboarding, & kelola user
│
├── public/
│   ├── css/
│   │   └── style.css          # Desain sistem antarmuka, variabel warna, & layout modern
│   ├── img/
│   │   ├── library_reading_room.jpg               # Gambar latar beranda
│   │   └── logo_smp-informatika-bina-generasi.png  # Logo resmi sekolah
│   ├── js/
│   │   ├── api.js             # Modul wrapper HTTP fetch request ke backend API
│   │   ├── app.js             # Entry point inisialisasi router SPA
│   │   ├── auth.js            # Manajemen session, token JWT, & state login
│   │   ├── components.js      # Komponen UI dinamis (Navbar, Sidebar, Modal, Toast)
│   │   ├── router.js          # Client-side hash routing SPA
│   │   └── pages/
│   │       ├── admin-bookings.js       # Antarmuka sirkulasi booking bagi admin
│   │       ├── admin-books.js          # Antarmuka kelola buku bagi admin
│   │       ├── admin-dashboard.js      # Antarmuka dashboard admin
│   │       ├── admin-landing.js        # Antarmuka editor CMS landing page
│   │       ├── admin-reports.js        # Antarmuka laporan analitik admin
│   │       ├── admin-users.js          # Antarmuka manajemen user admin
│   │       ├── book-condition.js       # Antarmuka inspeksi kondisi buku & chart donat
│   │       ├── book-detail.js          # Modal penyajian detail buku
│   │       ├── book-management.js      # Manajemen koleksi buku terpadu
│   │       ├── catalog.js              # Halaman katalog pencarian buku siswa
│   │       ├── category-management.js  # Manajemen kategori buku
│   │       ├── circulation.js          # Halaman pengelolaan sirkulasi terpadu
│   │       ├── dashboard.js            # Halaman utama dashboard pengguna
│   │       ├── first-login.js          # Wizard onboarding akun pertama siswa
│   │       ├── landing-services.js     # Halaman informasi layanan perpustakaan
│   │       ├── landing.js              # Beranda publik perpustakaan sekolah
│   │       ├── login.js                # Halaman masuk sistem
│   │       ├── my-bookings.js          # Riwayat booking & peminjaman siswa
│   │       ├── profile.js              # Halaman profil & ubah kata sandi
│   │       ├── register.js             # Halaman pendaftaran siswa mandiri
│   │       ├── reports.js              # Halaman ekspor & rekapitulasi laporan
│   │       └── user-management.js      # Halaman pengelolaan pengguna
│   └── index.html             # Dokumen HTML tunggal aplikasi (SPA Container)
│
├── uploads/
│   ├── avatars/               # Direktori penyimpanan foto profil pengguna
│   └── covers/                # Direktori penyimpanan gambar sampul buku
│
├── .env                       # Berkas variabel lingkungan konfigurasi server
├── .gitignore                 # Berkas pengabaian berkas pada repositori Git
├── package.json               # Konfigurasi dependensi dan skrip proyek
├── perpustakaan.sql           # Skrip basis data awal sistem perpustakaan
└── server.js                  # Entry point peladen Express.js utama
```

---

## Penulis
Ditulis dan dikembangkan oleh: [Raffael Fidhera](https://instagram.com/fidhera)
