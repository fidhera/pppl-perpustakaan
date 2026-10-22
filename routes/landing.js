const express = require('express');
const router = express.Router();
const { Book, BookCopy, Booking, User, LandingSetting } = require('../models');
const { authenticate, isAdmin } = require('../middleware/auth');
const { uploadCover } = require('../middleware/upload');

// Default initial settings matching the design screenshots
const defaultLandingSettings = {
    hero: {
        badge: 'PERPUSTAKAAN DIGITAL RESMI',
        title: 'Rumah bagi setiap',
        title_highlight: 'masa depan.',
        subtitle: 'Pusat eksplorasi literasi, materi pembelajaran Kurikulum Merdeka, dan referensi akademik siswa-siswi SMP Informatika Bina Generasi Bogor.',
        search_placeholder: 'Cari judul buku, pengarang, materi pelajaran, atau ISBN...'
    },
    hero_cards: [
        {
            id: 1,
            title: 'Koleksi Pelajaran & Modul Siswa',
            category: 'KURIKULUM MERDEKA',
            badge: 'Buku Paket',
            desc: 'Akses lengkap buku cetak dan digital untuk kelas VII, VIII, dan IX SMP Informatika Bina Generasi.',
            color_gradient: 'linear-gradient(135deg, #7c3aed, #4c1d95)'
        },
        {
            id: 2,
            title: 'E-Book & BSE Kemendikbud',
            category: 'DIGITAL REPOSITORY',
            badge: 'BSE Resmi',
            desc: 'Buku Sekolah Elektronik interaktif yang dapat diakses langsung oleh siswa dan dewan guru.',
            color_gradient: 'linear-gradient(135deg, #6d28d9, #5b21b6)'
        },
        {
            id: 3,
            title: 'Karya Tulis & Literasi Siswa',
            category: 'PUBLIKASI SEKOLAH',
            badge: 'Prestasi',
            desc: 'Kumpulan cerpen, artikel sains, puisi, dan laporan proyek P5 terbaik karya siswa-siswi berprestasi.',
            color_gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)'
        },
        {
            id: 4,
            title: 'Ensiklopedia Sains & Teknologi',
            category: 'REFERENSI AKADEMIK',
            badge: 'Ensiklopedia',
            desc: 'Rujukan ilmu pengetahuan umum, sejarah dunia, teknologi komputer, dan inovasi masa depan.',
            color_gradient: 'linear-gradient(135deg, #d97706, #b45309)'
        },
        {
            id: 5,
            title: 'Sastra, Fiksi & Novel Populer',
            category: 'PENGEMBANGAN MINAT',
            badge: 'Fiksi Terpilih',
            desc: 'Koleksi novel remaja, fiksi inspiratif, biografi tokoh, dan komik edukasi untuk waktu senggang.',
            color_gradient: 'linear-gradient(135deg, #9333ea, #7e22ce)'
        }
    ],
    academic_needs: {
        title: 'Segala Kebutuhan Akademik Anda',
        subtitle: 'Pusat layanan literasi dan referensi digital yang mempermudah kegiatan belajar mengajar siswa dan guru.',
        main_cards: [
            {
                tag: 'KOLEKSI UTAMA',
                title: 'Repository Buku Pelajaran & Tugas Akhir Siswa',
                desc: 'Akses koleksi buku kurikulum resmi, modul praktikum informatika, dan laporan proyek siswa SMP Informatika Bina Generasi.',
                link_text: 'Jelajahi Koleksi',
                theme: 'purple'
            },
            {
                tag: 'E-BOOK & BSE',
                title: 'Buku Sekolah Elektronik & Rujukan Nasional',
                desc: 'Koleksi digital gratis dari Kemendikbudristek dan perpustakaan nasional yang siap dibaca secara online kapan saja.',
                link_text: 'Lihat E-Book',
                theme: 'white'
            }
        ],
        grid_cards: [
            {
                icon: 'fa-solid fa-magnifying-glass',
                title: 'Katalog OPAC',
                desc: 'Pencarian cepat ketersediaan eksemplar buku, nomor panggil, dan posisi rak di ruang perpustakaan.',
                link: '#layanan'
            },
            {
                icon: 'fa-solid fa-newspaper',
                title: 'E-Paper & Mading',
                desc: 'Publikasi berkala majalah dinding sekolah, karya sastra siswa, dan info agenda literasi bulanan.',
                link: '#layanan'
            },
            {
                icon: 'fa-solid fa-user-graduate',
                title: 'Unggah Karya Siswa',
                desc: 'Fasilitas serah simpan karya literasi siswa berprestasi untuk diabadikan dalam repository sekolah.',
                link: '#layanan'
            },
            {
                icon: 'fa-solid fa-heart-circle-plus',
                title: 'Usulan Buku Baru',
                desc: 'Siswa dan guru dapat merekomendasikan judul buku pelajaran atau fiksi baru yang ingin dibaca.',
                link: '#layanan'
            }
        ]
    },
    facility: {
        title: 'Ruang membaca yang nyaman, suasana yang mendukung.',
        subtitle: 'Perpustakaan SMP Informatika Bina Generasi dirancang khusus untuk menciptakan lingkungan belajar yang kondusif, tenang, dan bersahabat.',
        image: '/img/library_reading_room.jpg',
        points: [
            'Ruang baca ber-AC, pencahayaan alami optimal, dan tempat duduk ergonomis',
            'Koleksi buku pelajaran, fiksi, dan sains terlengkap & tertata rapi',
            'Fasilitas sudut komputer riset & internet WiFi kecepatan tinggi untuk siswa',
            'Pustakawan ramah yang siap memandu pencarian referensi belajar'
        ],
        highlight_box: {
            title: 'Sudut Baca & Diskusi Interaktif',
            desc: 'Area khusus untuk kerja kelompok, bedah buku, dan kegiatan pojok literasi sekolah.'
        }
    },
    stats: {
        total_books: '35K+',
        total_borrows: '64,196',
        active_members: '1,609',
        daily_visitors: '250+'
    },
    locations: [
        {
            name: 'Perpustakaan Utama (Gedung A Lt. 2)',
            days: 'Senin - Kamis: 07.30 - 15.30 WIB',
            friday: 'Jumat: 07.30 - 11.30 WIB',
            saturday: 'Sabtu: Layanan Khusus Kegiatan Ekskul',
            sunday: 'Minggu: Tutup'
        },
        {
            name: 'Pojok Baca & Ruang Riset Digital (Gedung B Lt. 1)',
            days: 'Senin - Kamis: 08.00 - 15.00 WIB',
            friday: 'Jumat: 08.00 - 11.30 WIB',
            saturday: 'Sabtu: Pelatihan Literasi Digital Siswa',
            sunday: 'Minggu: Tutup'
        }
    ],
    footer: {
        description: 'Perpustakaan SMP Informatika Bina Generasi Bogor merupakan pusat sumber belajar yang berdedikasi tinggi untuk menumbuhkan minat baca, memperluas wawasan keilmuan, dan mendukung prestasi akademik civitas akademika.',
        address: 'Jl. Babakan Madang No. 45, Sentul, Bogor, Jawa Barat 16810',
        phone: '(0251) 827-0100',
        email: 'perpustakaan@smp-informatika-binagenerasi.sch.id',
        socials: {
            facebook: '#',
            instagram: '#',
            youtube: '#'
        }
    }
};

// GET /api/landing/settings (Public)
router.get('/settings', async (req, res) => {
    try {
        let settings = defaultLandingSettings;

        // Try load from DB if available
        try {
            await LandingSetting.sync();
            const record = await LandingSetting.findOne({ where: { key: 'main_landing_config' } });
            if (record && record.value) {
                const parsed = JSON.parse(record.value);
                settings = { ...defaultLandingSettings, ...parsed };
            }
        } catch (dbErr) {
            console.log('Using default landing settings:', dbErr.message);
        }

        // Compute dynamic actual statistics from DB to augment stats
        try {
            const actualBookCount = await Book.count({ where: { is_active: true } });
            const actualCopyCount = await BookCopy.count();
            const actualBookingCount = await Booking.count();
            const actualMemberCount = await User.count({ where: { is_active: true } });

            settings.dynamic_stats = {
                books_count: actualBookCount,
                copies_count: actualCopyCount,
                bookings_count: actualBookingCount,
                members_count: actualMemberCount
            };
        } catch (stErr) {
            // ignore
        }

        res.json({
            success: true,
            data: settings
        });
    } catch (error) {
        console.error('Error get landing settings:', error);
        res.status(500).json({ success: false, message: 'Gagal memuat pengaturan landing page.' });
    }
});

// PUT /api/landing/settings (Admin Only)
router.put('/settings', authenticate, isAdmin, async (req, res) => {
    try {
        await LandingSetting.sync();
        const newSettings = req.body;

        let record = await LandingSetting.findOne({ where: { key: 'main_landing_config' } });
        if (record) {
            await record.update({ value: JSON.stringify(newSettings) });
        } else {
            await LandingSetting.create({
                key: 'main_landing_config',
                value: JSON.stringify(newSettings)
            });
        }

        res.json({
            success: true,
            message: 'Pengaturan landing page berhasil diperbarui!',
            data: newSettings
        });
    } catch (error) {
        console.error('Error save landing settings:', error);
        res.status(500).json({ success: false, message: 'Gagal menyimpan pengaturan landing page.' });
    }
});

module.exports = router;
