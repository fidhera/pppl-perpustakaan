-- ==========================================================
-- Database: perpustakaan
-- Website Pengelolaan Perpustakaan Digital Modern
-- Node.js & Express + MySQL (Laragon / phpMyAdmin)
-- ==========================================================

CREATE DATABASE IF NOT EXISTS `perpustakaan` 
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `perpustakaan`;

-- --------------------------------------------------------
-- Drop Tables if exists in order of foreign key dependency
-- --------------------------------------------------------
DROP TABLE IF EXISTS `landing_settings`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `returns`;
DROP TABLE IF EXISTS `bookings`;
DROP TABLE IF EXISTS `book_copies`;
DROP TABLE IF EXISTS `books`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `users`;

-- --------------------------------------------------------
-- 1. Tabel users
-- --------------------------------------------------------
CREATE TABLE `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) DEFAULT NULL,
  `nis` VARCHAR(30) DEFAULT NULL,
  `nama` VARCHAR(100) NOT NULL,
  `kelas` VARCHAR(50) DEFAULT '-',
  `email` VARCHAR(100) DEFAULT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'pimpinan', 'siswa') DEFAULT 'siswa',
  `is_active` TINYINT(1) DEFAULT 1,
  `is_first_login` TINYINT(1) NOT NULL DEFAULT 1,
  `avatar` VARCHAR(255) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username_unique` (`username`),
  UNIQUE KEY `nis_unique` (`nis`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 2. Tabel categories
-- --------------------------------------------------------
CREATE TABLE `categories` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(20) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code_unique` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 3. Tabel books
-- --------------------------------------------------------
CREATE TABLE `books` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `kode_buku` VARCHAR(50) NOT NULL,
  `judul` VARCHAR(200) NOT NULL,
  `pengarang` VARCHAR(100) NOT NULL,
  `penerbit` VARCHAR(100) NOT NULL,
  `tahun_terbit` INT NOT NULL,
  `isbn` VARCHAR(50) DEFAULT NULL,
  `genre` VARCHAR(50) NOT NULL,
  `stok` INT NOT NULL DEFAULT 1,
  `condition` ENUM('Baik', 'Rusak Ringan', 'Rusak Berat', 'Hilang') NOT NULL DEFAULT 'Baik',
  `status` ENUM('Tersedia', 'Dipinjam', 'Hilang') NOT NULL DEFAULT 'Tersedia',
  `condition_notes` TEXT DEFAULT NULL,
  `condition_updated_by` VARCHAR(100) DEFAULT NULL,
  `cover` VARCHAR(255) DEFAULT NULL,
  `deskripsi` TEXT DEFAULT NULL,
  `lokasi_rak` VARCHAR(50) DEFAULT 'Umum',
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `kode_buku_unique` (`kode_buku`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 4. Tabel book_copies (Eksemplar Fisik Buku)
-- --------------------------------------------------------
CREATE TABLE `book_copies` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `book_id` INT NOT NULL,
  `kode_eksemplar` VARCHAR(80) NOT NULL,
  `condition` ENUM('Baik', 'Rusak Ringan', 'Rusak Berat', 'Hilang') NOT NULL DEFAULT 'Baik',
  `condition_notes` TEXT DEFAULT NULL,
  `status` ENUM('tersedia', 'dipinjam', 'hilang') NOT NULL DEFAULT 'tersedia',
  `condition_updated_by` VARCHAR(100) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `kode_eksemplar_unique` (`kode_eksemplar`),
  KEY `fk_book_copies_book` (`book_id`),
  CONSTRAINT `fk_book_copies_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 5. Tabel bookings (Peminjaman & Permohonan)
-- --------------------------------------------------------
CREATE TABLE `bookings` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `kode_booking` VARCHAR(50) NOT NULL,
  `user_id` INT NOT NULL,
  `book_id` INT NOT NULL,
  `book_copy_id` INT DEFAULT NULL,
  `tgl_booking` DATE NOT NULL,
  `tgl_ambil` DATE DEFAULT NULL,
  `tgl_kembali_rencana` DATE NOT NULL,
  `status` ENUM('pending', 'disetujui', 'ditolak', 'diambil', 'dikembalikan', 'terlambat') DEFAULT 'pending',
  `catatan` TEXT DEFAULT NULL,
  `alasan_tolak` TEXT DEFAULT NULL,
  `approved_by` INT DEFAULT NULL,
  `approved_at` DATETIME DEFAULT NULL,
  `picked_up_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `kode_booking_unique` (`kode_booking`),
  KEY `fk_bookings_user` (`user_id`),
  KEY `fk_bookings_book` (`book_id`),
  KEY `fk_bookings_book_copy` (`book_copy_id`),
  CONSTRAINT `fk_bookings_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_bookings_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_bookings_book_copy` FOREIGN KEY (`book_copy_id`) REFERENCES `book_copies` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 6. Tabel returns
-- --------------------------------------------------------
CREATE TABLE `returns` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `booking_id` INT NOT NULL,
  `tgl_kembali` DATE NOT NULL,
  `kondisi` ENUM('baik', 'rusak_ringan', 'rusak_berat', 'hilang') DEFAULT 'baik',
  `denda` DECIMAL(10, 2) DEFAULT 0.00,
  `catatan` TEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `booking_id_unique` (`booking_id`),
  CONSTRAINT `fk_returns_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 7. Tabel notifications
-- --------------------------------------------------------
CREATE TABLE `notifications` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `judul` VARCHAR(200) NOT NULL,
  `pesan` TEXT NOT NULL,
  `tipe` ENUM('booking', 'approval', 'reminder', 'info', 'warning') DEFAULT 'info',
  `is_read` TINYINT(1) DEFAULT 0,
  `link` VARCHAR(255) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_notifications_user` (`user_id`),
  CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 8. Tabel landing_settings (Konfigurasi Konten Beranda & CMS)
-- --------------------------------------------------------
CREATE TABLE `landing_settings` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `key` VARCHAR(100) NOT NULL,
  `value` LONGTEXT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `key_unique` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Data Awal: Users
-- Admin: admin / admin123
-- Pimpinan: pimpinan / pimpinan123
-- Siswa NISN: 0053135192 / siswa123 (Aktivasi pertama)
-- --------------------------------------------------------
INSERT INTO `users` (`id`, `username`, `nis`, `nama`, `kelas`, `email`, `password`, `role`, `is_active`, `is_first_login`, `created_at`, `updated_at`) VALUES
(1, 'admin', 'ADMIN001', 'Administrator Perpustakaan', '-', 'admin@perpustakaan.com', '$2b$10$0hJ.tIMdbJpmHOnFOh.nMOzM4BPv4D7FiQY/s32ynn4.bCU7BVaH6', 'admin', 1, 0, NOW(), NOW()),
(2, 'pimpinan', 'PIMPINAN001', 'Kepala Perpustakaan', '-', 'pimpinan@perpustakaan.com', '$2b$10$vFy7xwV3lejdftfGAf7.vuBIMyqWxk88J2JAsiEfD.wzhTRXmAL..', 'pimpinan', 1, 0, NOW(), NOW()),
(3, '0053135192', '0053135192', 'Siswa Baru', 'XII-MIPA-1', '0053135192@siswa.perpustakaan.sch.id', '$2b$10$3dyouKBFvFeTlqnXXgap/OacSWhe/ehbVZg5jsG89PXuaCrUnRcHG', 'siswa', 1, 1, NOW(), NOW()),
(4, '53135192', '53135192', 'Raffael F', 'XII-MIPA-1', NULL, '$2b$10$3dyouKBFvFeTlqnXXgap/OacSWhe/ehbVZg5jsG89PXuaCrUnRcHG', 'siswa', 1, 1, NOW(), NOW()),
(5, '53135193', '53135193', 'Adam Pratama', 'XII-MIPA-1', NULL, '$2b$10$3dyouKBFvFeTlqnXXgap/OacSWhe/ehbVZg5jsG89PXuaCrUnRcHG', 'siswa', 1, 1, NOW(), NOW()),
(6, '53135194', '53135194', 'Fahmi Hidayat', 'XII-MIPA-2', NULL, '$2b$10$3dyouKBFvFeTlqnXXgap/OacSWhe/ehbVZg5jsG89PXuaCrUnRcHG', 'siswa', 1, 1, NOW(), NOW()),
(7, '53135195', '53135195', 'Fikri Ramadhan', 'XI-IPS-1', NULL, '$2b$10$3dyouKBFvFeTlqnXXgap/OacSWhe/ehbVZg5jsG89PXuaCrUnRcHG', 'siswa', 1, 1, NOW(), NOW()),
(8, '53135196', '53135196', 'Ridho Saputra', 'XI-IPS-2', NULL, '$2b$10$3dyouKBFvFeTlqnXXgap/OacSWhe/ehbVZg5jsG89PXuaCrUnRcHG', 'siswa', 1, 1, NOW(), NOW()),
(9, '53135197', '53135197', 'Raihan Aditya', 'X-1', NULL, '$2b$10$3dyouKBFvFeTlqnXXgap/OacSWhe/ehbVZg5jsG89PXuaCrUnRcHG', 'siswa', 1, 1, NOW(), NOW()),
(10, '53135198', '53135198', 'Rafly Ramadhan', 'X-2', NULL, '$2b$10$3dyouKBFvFeTlqnXXgap/OacSWhe/ehbVZg5jsG89PXuaCrUnRcHG', 'siswa', 1, 1, NOW(), NOW());

-- --------------------------------------------------------
-- Data Awal: Categories
-- --------------------------------------------------------
INSERT INTO `categories` (`id`, `code`, `name`, `description`, `created_at`, `updated_at`) VALUES
(1, 'FIK', 'Fiksi', 'Buku-buku fiksi dan novel', NOW(), NOW()),
(2, 'EDU', 'Pendidikan', 'Buku-buku pendidikan dan akademik', NOW(), NOW()),
(3, 'TEK', 'Teknologi', 'Buku-buku tentang teknologi dan komputer', NOW(), NOW()),
(4, 'SEJ', 'Sejarah', 'Buku-buku sejarah dan biografi', NOW(), NOW()),
(5, 'FIL', 'Filsafat', 'Buku-buku filsafat dan pemikiran', NOW(), NOW()),
(6, 'SLF', 'Self-Help', 'Buku pengembangan diri dan motivasi', NOW(), NOW()),
(7, 'AKA', 'Akademik', 'Buku teks akademik dan sains', NOW(), NOW());

-- --------------------------------------------------------
-- Data Awal: Books (12 Buku Koleksi Acuan)
-- --------------------------------------------------------
INSERT INTO `books` (`id`, `kode_buku`, `judul`, `pengarang`, `penerbit`, `tahun_terbit`, `isbn`, `genre`, `stok`, `condition`, `status`, `condition_notes`, `condition_updated_by`, `cover`, `deskripsi`, `lokasi_rak`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'FIK-001', 'Laskar Pelangi', 'Andrea Hirata', 'Bentang Pustaka', 2005, '978-979-3062-79-2', 'Fiksi', 5, 'Baik', 'Tersedia', 'Kondisi buku sangat baik', 'Admin', '/uploads/covers/cover-laskar-pelangi.jpg', 'Novel yang menceritakan kisah 10 anak dari keluarga miskin yang bersekolah di SD Muhammadiyah di Belitung. Mereka berjuang keras untuk mendapatkan pendidikan yang layak.', 'Rak A-01', 1, NOW(), NOW()),
(2, 'SEJ-001', 'Bumi Manusia', 'Pramoedya Ananta Toer', 'Hasta Mitra', 1980, '978-979-97312-3-4', 'Sejarah', 3, 'Baik', 'Tersedia', 'Kondisi terawat', 'Admin', '/uploads/covers/cover-1791733747620-376251682.jpg', 'Novel pertama dari Tetralogi Buru. Mengisahkan Minke, seorang pribumi yang terdidik di sekolah Eropa, dan cintanya pada Annelies Mellema.', 'Rak A-02', 1, NOW(), NOW()),
(3, 'FIL-001', 'Filosofi Teras', 'Henry Manampiring', 'Kompas', 2018, '978-602-412-518-9', 'Filsafat', 4, 'Baik', 'Tersedia', 'Kondisi sangat baik', 'Admin', NULL, 'Buku tentang filsafat Stoa yang dikemas secara ringan dan relevan dengan kehidupan modern. Mengajarkan cara mengelola emosi dan menghadapi masalah.', 'Rak B-01', 1, NOW(), NOW()),
(4, 'SLF-001', 'Atomic Habits', 'James Clear', 'Gramedia', 2018, '978-602-06-3317-6', 'Self-Help', 6, 'Baik', 'Tersedia', 'Kondisi prima', 'Admin', '/uploads/covers/cover-atomic-habits.jpg', 'Panduan praktis untuk membentuk kebiasaan baik dan menghilangkan kebiasaan buruk. Berdasarkan riset ilmiah tentang perubahan perilaku.', 'Rak B-02', 1, NOW(), NOW()),
(5, 'SEJ-002', 'Sapiens: A Brief History of Humankind', 'Yuval Noah Harari', 'Gramedia', 2011, '978-602-424-416-3', 'Sejarah', 2, 'Rusak Ringan', 'Tersedia', 'Cover sedikit robek di pojok', 'Admin', NULL, 'Buku yang membahas sejarah umat manusia dari zaman purba hingga modern.', 'Rak C-01', 1, NOW(), NOW()),
(6, 'AKA-001', 'Matematika Diskrit', 'Rinaldi Munir', 'Informatika', 2016, '978-602-1514-96-2', 'Akademik', 8, 'Baik', 'Tersedia', 'Buku baru', 'Admin', NULL, 'Buku teks matematika diskrit untuk mahasiswa informatika dan teknik komputer.', 'Rak D-01', 1, NOW(), NOW()),
(7, 'FIK-002', 'Negeri 5 Menara', 'Ahmad Fuadi', 'Gramedia', 2009, '978-979-22-4861-6', 'Fiksi', 4, 'Baik', 'Tersedia', 'Kondisi baik', 'Admin', NULL, 'Novel inspiratif tentang kehidupan 6 santri di pesantren Madani.', 'Rak A-03', 1, NOW(), NOW()),
(8, 'SEJ-003', 'Sejarah Indonesia Modern', 'M.C. Ricklefs', 'Serambi', 2005, '978-979-16001-2-5', 'Sejarah', 3, 'Baik', 'Tersedia', 'Buku referensi lengkap', 'Admin', NULL, 'Buku referensi komprehensif tentang sejarah Indonesia dari abad ke-13 hingga era reformasi.', 'Rak C-02', 1, NOW(), NOW()),
(9, 'TEK-001', 'Pemrograman Web dengan PHP dan MySQL', 'Lukmanul Hakim', 'Lokomedia', 2014, '978-602-1234-56-7', 'Teknologi', 5, 'Baik', 'Tersedia', 'Kondisi baik', 'Admin', NULL, 'Panduan lengkap belajar pemrograman web menggunakan PHP dan MySQL untuk pemula hingga menengah.', 'Rak D-02', 1, NOW(), NOW()),
(10, 'SLF-002', 'The Psychology of Money', 'Morgan Housel', 'Gramedia', 2020, '978-602-06-4782-1', 'Self-Help', 3, 'Baik', 'Tersedia', 'Buku sangat terawat', 'Admin', NULL, 'Buku tentang bagaimana psikologi mempengaruhi keputusan keuangan kita.', 'Rak B-03', 1, NOW(), NOW()),
(11, 'AKA-002', 'Fisika Dasar', 'Halliday, Resnick & Walker', 'Erlangga', 2013, '978-979-015-896-3', 'Akademik', 7, 'Rusak Berat', 'Tersedia', 'Jilidan halaman lepas', 'Admin', NULL, 'Buku teks fisika dasar yang komprehensif.', 'Rak D-03', 1, NOW(), NOW()),
(12, 'FIK-003', 'Dilan 1990', 'Pidi Baiq', 'Pastel Books', 2014, '978-602-7870-86-4', 'Fiksi', 0, 'Hilang', 'Hilang', 'Buku tidak ditemukan saat stok opname', 'Admin', NULL, 'Novel romantis yang mengisahkan kisah cinta Dilan dan Milea di Bandung tahun 1990.', 'Rak A-04', 1, NOW(), NOW());

-- --------------------------------------------------------
-- Data Awal: Book Copies (Kondisi Fisik per Eksemplar)
-- --------------------------------------------------------
INSERT INTO `book_copies` (`book_id`, `kode_eksemplar`, `condition`, `condition_notes`, `status`, `condition_updated_by`)
SELECT b.`id`,
       CONCAT(COALESCE(NULLIF(b.`kode_buku`, ''), CONCAT('BK-', b.`id`)), '-', LPAD(copy_numbers.`copy_no`, 3, '0')),
       CASE 
         WHEN copy_numbers.`copy_no` = b.`stok` AND b.`stok` >= 4 THEN 'Rusak Berat'
         WHEN copy_numbers.`copy_no` = b.`stok` - 1 AND b.`stok` >= 3 THEN 'Rusak Ringan'
         ELSE 'Baik'
       END,
       CASE 
         WHEN copy_numbers.`copy_no` = b.`stok` AND b.`stok` >= 4 THEN 'Jilidan lepas, butuh perbaikan'
         WHEN copy_numbers.`copy_no` = b.`stok` - 1 AND b.`stok` >= 3 THEN 'Cover sudut terlipat'
         ELSE 'Kondisi buku baik'
       END,
       'tersedia',
       'Sistem Perpustakaan'
FROM `books` b
JOIN (
  SELECT 1 AS `copy_no` UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5
  UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10
) AS copy_numbers ON copy_numbers.`copy_no` <= b.`stok`
WHERE b.`stok` > 0;

-- --------------------------------------------------------
-- Data Awal: Landing Settings (Konfigurasi Beranda & CMS)
-- --------------------------------------------------------
INSERT INTO `landing_settings` (`id`, `key`, `value`, `created_at`, `updated_at`) VALUES
(1, 'main_landing_config', '{"hero_eyebrow":"PERPUSTAKAAN DIGITAL TERPADU","hero_title":"Rumah bagi setiap masa depan.","hero_subtitle":"Pusat eksplorasi literasi, materi pembelajaran Kurikulum Merdeka, dan referensi akademik siswa-siswi SMP Informatika Bina Generasi Bogor.","cards":[{"badge":"KURIKULUM MERDEKA","title":"Koleksi Pelajaran & Modul Siswa","desc":"Akses lengkap buku cetak dan digital untuk kelas VII, VIII, dan IX SMP Informatika Bina Generasi.","meta":"Buku Paket Resmi"},{"badge":"DIGITAL REPOSITORY","title":"E-Book & BSE Kemendikbud","desc":"Buku Sekolah Elektronik interaktif yang dapat diakses langsung oleh siswa dan dewan guru.","meta":"BSE Kemendikbud"},{"badge":"PUBLIKASI SEKOLAH","title":"Karya Tulis & Literasi Siswa","desc":"Kumpulan cerpen, artikel sains, puisi, dan laporan proyek P5 terbaik karya siswa-siswi berprestasi.","meta":"Prestasi Siswa"},{"badge":"REFERENSI AKADEMIK","title":"Ensiklopedia Sains & Teknologi","desc":"Rujukan ilmu pengetahuan umum, sejarah dunia, teknologi komputer, dan inovasi masa depan.","meta":"Ensiklopedia"},{"badge":"PENGEMBANGAN MINAT","title":"Sastra, Fiksi & Novel Populer","desc":"Koleksi novel remaja, fiksi inspiratif, biografi tokoh, dan komik edukasi untuk waktu senggang.","meta":"Fiksi Terpilih"}],"stats":{"stat1_num":"35K+","stat1_label":"Koleksi Buku & E-Book","stat2_num":"64,196","stat2_label":"Sirkulasi Peminjaman","stat3_num":"1,609","stat3_label":"Anggota Terdaftar","stat4_num":"250+","stat4_label":"Kategori Topik"},"school_name":"SMP Informatika Bina Generasi","address":"Jl. Raya Ciawi - Gadog No. 12, Kab. Bogor","phone":"(0251) 8241234","email":"perpustakaan@smp-ibg.sch.id","footer_desc":"Perpustakaan SMP Informatika Bina Generasi merupakan pusat sumber belajar yang berdedikasi tinggi untuk menumbuhkan minat baca, memperluas wawasan keilmuan, dan mendukung prestasi akademik civitas akademika."}', NOW(), NOW());
