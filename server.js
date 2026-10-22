const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { sequelize, User } = require('./models');

// Import routes
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const bookingRoutes = require('./routes/bookings');
const userRoutes = require('./routes/users');
const notificationRoutes = require('./routes/notifications');
const reportRoutes = require('./routes/reports');
const categoryRoutes = require('./routes/categories');
const landingRoutes = require('./routes/landing');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/landing', landingRoutes);

// SPA - serve index.html for all non-API routes
app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
        return res.sendFile(path.join(__dirname, 'public', 'index.html'));
    }
    next();
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    
    if (err.name === 'MulterError') {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'Ukuran file terlalu besar. Maksimal 5MB.'
            });
        }
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }

    res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server.'
    });
});

// Database sync and seed
async function initializeDatabase() {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected successfully.');

        // Sync all models safely without alter to prevent MySQL duplicate key accumulation
        await sequelize.sync();
        console.log('✅ Database tables synced.');

        // Seed default categories if none exist
        const { Category } = require('./models');
        const catCount = await Category.count();
        if (catCount === 0) {
            await Category.bulkCreate([
                { code: 'FIK', name: 'Fiksi', description: 'Buku-buku fiksi dan novel' },
                { code: 'EDU', name: 'Pendidikan', description: 'Buku-buku pendidikan dan akademik' },
                { code: 'TEK', name: 'Teknologi', description: 'Buku-buku tentang teknologi dan komputer' },
                { code: 'SEJ', name: 'Sejarah', description: 'Buku-buku sejarah dan biografi' },
                { code: 'FIL', name: 'Filsafat', description: 'Buku-buku filsafat dan pemikiran' },
                { code: 'SLF', name: 'Self-Help', description: 'Buku pengembangan diri dan motivasi' },
                { code: 'AKA', name: 'Akademik', description: 'Buku teks akademik dan sains' }
            ]);
            console.log('✅ Default categories seeded.');
        }

        // Create default admin if not exists
        const adminUser = await User.findOne({ where: { role: 'admin' } });
        if (!adminUser) {
            await User.create({
                username: 'admin',
                nis: 'ADMIN001',
                nama: 'Administrator',
                email: 'admin@perpustakaan.com',
                kelas: '-',
                password: 'admin123',
                role: 'admin',
                is_active: true
            });
            console.log('✅ Default admin created (User: admin, Pass: admin123)');
        } else if (!adminUser.username) {
            await adminUser.update({ username: 'admin' });
        }

        // Create default pimpinan if not exists
        const pimpinanUser = await User.findOne({ where: { role: 'pimpinan' } });
        if (!pimpinanUser) {
            await User.create({
                username: 'pimpinan',
                nis: 'PIMPINAN001',
                nama: 'Kepala Perpustakaan',
                email: 'pimpinan@perpustakaan.com',
                kelas: '-',
                password: 'pimpinan123',
                role: 'pimpinan',
                is_active: true
            });
            console.log('✅ Default pimpinan created (User: pimpinan, Pass: pimpinan123)');
        }

        // Seed sample books if none exist
        const { Book } = require('./models');
        const bookCount = await Book.count();
        if (bookCount === 0) {
            const sampleBooks = [
                {
                    judul: 'Laskar Pelangi',
                    pengarang: 'Andrea Hirata',
                    penerbit: 'Bentang Pustaka',
                    tahun_terbit: 2005,
                    genre: 'Novel',
                    stok: 5,
                    deskripsi: 'Novel yang menceritakan kisah 10 anak dari keluarga miskin yang bersekolah di SD Muhammadiyah di Belitung. Mereka berjuang keras untuk mendapatkan pendidikan yang layak dengan segala keterbatasan yang ada.',
                    lokasi_rak: 'A-01'
                },
                {
                    judul: 'Bumi Manusia',
                    pengarang: 'Pramoedya Ananta Toer',
                    penerbit: 'Hasta Mitra',
                    tahun_terbit: 1980,
                    genre: 'Novel',
                    stok: 3,
                    deskripsi: 'Novel pertama dari Tetralogi Buru. Mengisahkan Minke, seorang pribumi yang terdidik di sekolah Eropa, dan cintanya pada Annelies Mellema.',
                    lokasi_rak: 'A-02'
                },
                {
                    judul: 'Filosofi Teras',
                    pengarang: 'Henry Manampiring',
                    penerbit: 'Kompas',
                    tahun_terbit: 2018,
                    genre: 'Filsafat',
                    stok: 4,
                    deskripsi: 'Buku tentang filsafat Stoa yang dikemas secara ringan dan relevan dengan kehidupan modern. Mengajarkan cara mengelola emosi dan menghadapi masalah.',
                    lokasi_rak: 'B-01'
                },
                {
                    judul: 'Atomic Habits',
                    pengarang: 'James Clear',
                    penerbit: 'Gramedia',
                    tahun_terbit: 2018,
                    genre: 'Self-Help',
                    stok: 6,
                    deskripsi: 'Panduan praktis untuk membentuk kebiasaan baik dan menghilangkan kebiasaan buruk. Berdasarkan riset ilmiah tentang perubahan perilaku.',
                    lokasi_rak: 'B-02'
                },
                {
                    judul: 'Sapiens: A Brief History of Humankind',
                    pengarang: 'Yuval Noah Harari',
                    penerbit: 'Gramedia',
                    tahun_terbit: 2011,
                    genre: 'Sejarah',
                    stok: 2,
                    deskripsi: 'Buku yang membahas sejarah umat manusia dari zaman purba hingga modern. Mengeksplorasi bagaimana Homo sapiens menjadi spesies dominan.',
                    lokasi_rak: 'C-01'
                },
                {
                    judul: 'Matematika Diskrit',
                    pengarang: 'Rinaldi Munir',
                    penerbit: 'Informatika',
                    tahun_terbit: 2016,
                    genre: 'Akademik',
                    stok: 8,
                    deskripsi: 'Buku teks matematika diskrit untuk mahasiswa informatika dan teknik komputer. Membahas logika, himpunan, relasi, fungsi, graf, dan pohon.',
                    lokasi_rak: 'D-01'
                },
                {
                    judul: 'Negeri 5 Menara',
                    pengarang: 'Ahmad Fuadi',
                    penerbit: 'Gramedia',
                    tahun_terbit: 2009,
                    genre: 'Novel',
                    stok: 4,
                    deskripsi: 'Novel inspiratif tentang kehidupan 6 santri di pesantren Madani. Menceritakan persahabatan, impian, dan semangat pantang menyerah.',
                    lokasi_rak: 'A-03'
                },
                {
                    judul: 'Sejarah Indonesia Modern',
                    pengarang: 'M.C. Ricklefs',
                    penerbit: 'Serambi',
                    tahun_terbit: 2005,
                    genre: 'Sejarah',
                    stok: 3,
                    deskripsi: 'Buku referensi komprehensif tentang sejarah Indonesia dari abad ke-13 hingga era reformasi.',
                    lokasi_rak: 'C-02'
                },
                {
                    judul: 'Pemrograman Web dengan PHP dan MySQL',
                    pengarang: 'Lukmanul Hakim',
                    penerbit: 'Lokomedia',
                    tahun_terbit: 2014,
                    genre: 'Teknologi',
                    stok: 5,
                    deskripsi: 'Panduan lengkap belajar pemrograman web menggunakan PHP dan MySQL untuk pemula hingga menengah.',
                    lokasi_rak: 'D-02'
                },
                {
                    judul: 'The Psychology of Money',
                    pengarang: 'Morgan Housel',
                    penerbit: 'Gramedia',
                    tahun_terbit: 2020,
                    genre: 'Self-Help',
                    stok: 3,
                    deskripsi: 'Buku tentang bagaimana psikologi mempengaruhi keputusan keuangan kita. Berisi 19 cerita pendek tentang cara aneh manusia memikirkan uang.',
                    lokasi_rak: 'B-03'
                },
                {
                    judul: 'Fisika Dasar',
                    pengarang: 'Halliday, Resnick & Walker',
                    penerbit: 'Erlangga',
                    tahun_terbit: 2013,
                    genre: 'Akademik',
                    stok: 7,
                    deskripsi: 'Buku teks fisika dasar yang komprehensif. Membahas mekanika, termodinamika, gelombang, optik, dan fisika modern.',
                    lokasi_rak: 'D-03'
                },
                {
                    judul: 'Dilan 1990',
                    pengarang: 'Pidi Baiq',
                    penerbit: 'Pastel Books',
                    tahun_terbit: 2014,
                    genre: 'Novel',
                    stok: 0,
                    deskripsi: 'Novel romantis yang mengisahkan kisah cinta Dilan dan Milea di Bandung tahun 1990. Penuh dengan dialog ringan dan menghibur.',
                    lokasi_rak: 'A-04'
                }
            ];

            await Book.bulkCreate(sampleBooks);
            console.log('✅ Sample books seeded (12 books).');
        }

        // Seed sample students
        const studentCount = await User.count({ where: { role: 'siswa' } });
        if (studentCount === 0) {
            const sampleStudents = [
                { username: 'siswa', nis: '2024001', nama: 'Ahmad Rizki', email: 'siswa@perpustakaan.com', kelas: 'XII-IPA-1', password: 'siswa123', role: 'siswa' },
                { username: 'siti', nis: '2024002', nama: 'Siti Nurhaliza', email: 'siti@perpustakaan.com', kelas: 'XII-IPA-2', password: 'siswa123', role: 'siswa' },
                { username: 'budi', nis: '2024003', nama: 'Budi Santoso', email: 'budi@perpustakaan.com', kelas: 'XI-IPS-1', password: 'siswa123', role: 'siswa' },
            ];

            for (const student of sampleStudents) {
                await User.create(student);
            }
            console.log('✅ Sample students seeded (3 students).');
        }

        // Ensure student NISN 0053135192 exists for first-login demonstration
        const testStudent = await User.findOne({ where: { nis: '0053135192' } });
        if (!testStudent) {
            await User.create({
                username: '0053135192',
                nis: '0053135192',
                nama: 'Siswa Baru (0053135192)',
                email: '0053135192@siswa.perpustakaan.sch.id',
                kelas: 'XII-MIPA-1',
                password: 'siswa123',
                role: 'siswa',
                is_first_login: true,
                is_active: true
            });
            console.log('✅ Student 0053135192 seeded (password: siswa123, is_first_login: true)');
        }

        // Seed book copies if none exist
        const { BookCopy } = require('./models');
        const copyCount = await BookCopy.count();
        if (copyCount === 0) {
            const allBooks = await Book.findAll({ where: { is_active: true } });
            for (const b of allBooks) {
                const stock = Number(b.stok) || 0;
                if (stock > 0) {
                    const prefix = b.kode_buku ? b.kode_buku : ('BK-' + b.id);
                    const copiesToCreate = [];
                    for (let i = 1; i <= stock; i++) {
                        let cond = 'Baik';
                        let notes = null;
                        if (stock >= 4 && i === stock) {
                            cond = 'Rusak Berat';
                            notes = 'Jilid terlepas, halaman tengah longgar';
                        } else if (stock >= 3 && i === stock - 1) {
                            cond = 'Rusak Ringan';
                            notes = 'Cover sudut terlipat, sedikit noda pensil';
                        }
                        copiesToCreate.push({
                            book_id: b.id,
                            kode_eksemplar: `${prefix}-${String(i).padStart(3, '0')}`,
                            condition: cond,
                            condition_notes: notes,
                            status: 'tersedia',
                            condition_updated_by: 'Sistem Perpustakaan'
                        });
                    }
                    await BookCopy.bulkCreate(copiesToCreate, { ignoreDuplicates: true });
                }
            }
            console.log('✅ Physical book copies seeded with varied conditions.');
        }

    } catch (error) {
        console.error('❌ Database initialization error:', error);
        process.exit(1);
    }
}

// Start server
initializeDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`\n🚀 Server running at http://localhost:${PORT}`);
        console.log(`📚 Website Pengelolaan Perpustakaan - Ready!\n`);
        console.log(`Demo Logins:`);
        console.log(`  Admin    : admin    / admin123`);
        console.log(`  Pimpinan : pimpinan / pimpinan123`);
        console.log(`  Siswa    : siswa    / siswa123 (atau NIS 2024001)\n`);
    });
});
