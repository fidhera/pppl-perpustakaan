const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { body, validationResult } = require('express-validator');
const { Booking, Book, BookCopy, User, Return, Notification } = require('../models');
const { authenticate, isAdmin, isSiswa } = require('../middleware/auth');

const MAX_ACTIVE_BOOKINGS = 2;
const BORROW_DAYS = 7; // Default days to borrow

async function assignAvailableCopy(booking, book) {
    const availableCount = await BookCopy.count({ where: { book_id: book.id, status: 'tersedia' } });
    const missingCopies = Math.max(0, Number(book.stok) - availableCount);
    if (missingCopies) {
        const count = await BookCopy.count({ where: { book_id: book.id } });
        await BookCopy.bulkCreate(Array.from({ length: missingCopies }, (_, index) => ({
            book_id: book.id,
            kode_eksemplar: `${(book.kode_buku || `BK-${book.id}`).replace(/[^a-z0-9-]/gi, '-')}-${String(count + index + 1).padStart(3, '0')}`,
            condition: book.condition || 'Baik',
            condition_notes: book.condition_notes || null,
            status: 'tersedia',
            condition_updated_by: book.condition_updated_by || 'Admin'
        })), { ignoreDuplicates: true });
    }

    const copy = await BookCopy.findOne({ where: { book_id: book.id, status: 'tersedia' }, order: [['id', 'ASC']] });
    if (!copy) return false;
    await copy.update({ status: 'dipinjam' });
    await booking.update({ status: 'diambil', book_copy_id: copy.id });
    await book.update({ stok: Math.max(0, book.stok - 1) });
    return true;
}

function normalizeReturnCondition(condition) {
    return ({ baik: 'Baik', rusak_ringan: 'Rusak Ringan', rusak_berat: 'Rusak Berat', hilang: 'Hilang' })[condition] || 'Baik';
}

// Create booking (siswa only)
router.post('/', authenticate, isSiswa, async (req, res) => {
    try {
        const book_id = req.body.book_id || req.body.buku_id;
        const tgl_ambil = req.body.tgl_ambil || req.body.tanggal_rencana_ambil;
        const catatan = req.body.catatan || '';

        if (!book_id) {
            return res.status(400).json({ success: false, message: 'Buku wajib dipilih.' });
        }
        if (!tgl_ambil) {
            return res.status(400).json({ success: false, message: 'Tanggal pengambilan wajib diisi.' });
        }

        // Check active bookings limit
        const activeBookings = await Booking.count({
            where: {
                user_id: req.user.id,
                status: { [Op.in]: ['pending', 'disetujui', 'diambil'] }
            }
        });

        if (activeBookings >= MAX_ACTIVE_BOOKINGS) {
            return res.status(400).json({
                success: false,
                message: `Anda sudah memiliki ${MAX_ACTIVE_BOOKINGS} booking aktif. Selesaikan dulu sebelum booking baru.`
            });
        }

        // Check book exists and has stock
        const book = await Book.findByPk(book_id);
        if (!book || !book.is_active) {
            return res.status(404).json({
                success: false,
                message: 'Buku tidak ditemukan.'
            });
        }

        if (book.stok <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Stok buku sedang habis.'
            });
        }

        // Check if user already has active booking for this book
        const existingBooking = await Booking.findOne({
            where: {
                user_id: req.user.id,
                book_id,
                status: { [Op.in]: ['pending', 'disetujui', 'diambil'] }
            }
        });

        if (existingBooking) {
            return res.status(400).json({
                success: false,
                message: 'Anda sudah memiliki booking aktif untuk buku ini.'
            });
        }

        // Calculate return date
        const tglAmbil = new Date(tgl_ambil);
        const tglKembaliRencana = new Date(tglAmbil);
        tglKembaliRencana.setDate(tglKembaliRencana.getDate() + BORROW_DAYS);

        const booking = await Booking.create({
            user_id: req.user.id,
            book_id,
            tgl_booking: new Date(),
            tgl_ambil,
            tgl_kembali_rencana: tglKembaliRencana,
            status: 'pending',
            catatan
        });

        // Create notification
        await Notification.create({
            user_id: req.user.id,
            judul: 'Booking Berhasil Dibuat',
            pesan: `Booking buku "${book.judul}" berhasil. Menunggu persetujuan admin.`,
            tipe: 'booking'
        });

        const fullBooking = await Booking.findByPk(booking.id, {
            include: [
                { model: Book, as: 'book' },
                { model: User, as: 'user', attributes: ['id', 'nis', 'nama', 'kelas'] }
            ]
        });

        res.status(201).json({
            success: true,
            message: 'Booking berhasil dibuat. Menunggu persetujuan admin.',
            data: fullBooking
        });
    } catch (error) {
        console.error('Create booking error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

// Get my bookings (siswa)
router.get('/my', authenticate, isSiswa, async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const where = { user_id: req.user.id };
        if (status) where.status = status;

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { count, rows: bookings } = await Booking.findAndCountAll({
            where,
            include: [
                { model: Book, as: 'book' },
                { model: Return, as: 'return' }
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset
        });

        res.json({
            success: true,
            data: {
                bookings,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(count / parseInt(limit))
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

// Get all bookings (admin or general)
router.get('/', authenticate, async (req, res) => {
    try {
        const { status, page = 1, limit = 50, search = '' } = req.query;
        const where = {};
        if (status && status !== 'all') where.status = status;
        if (!req.user || req.user.role !== 'admin') {
            where.user_id = req.user.id;
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const includeUser = {
            model: User,
            as: 'user',
            attributes: ['id', 'nis', 'nama', 'kelas']
        };

        if (search) {
            includeUser.where = {
                [Op.or]: [
                    { nis: { [Op.like]: `%${search}%` } },
                    { nama: { [Op.like]: `%${search}%` } }
                ]
            };
        }

        const { count, rows: bookings } = await Booking.findAndCountAll({
            where,
            include: [
                includeUser,
                { model: Book, as: 'book' },
                { model: Return, as: 'return' }
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset
        });

        res.json({
            success: true,
            data: bookings,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get bookings error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

// Get all bookings (admin legacy route)
router.get('/admin/all', authenticate, isAdmin, async (req, res) => {
    try {
        const { status, page = 1, limit = 20, search = '' } = req.query;
        const where = {};
        if (status) where.status = status;

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const includeUser = {
            model: User,
            as: 'user',
            attributes: ['id', 'nis', 'nama', 'kelas']
        };

        if (search) {
            includeUser.where = {
                [Op.or]: [
                    { nis: { [Op.like]: `%${search}%` } },
                    { nama: { [Op.like]: `%${search}%` } }
                ]
            };
        }

        const { count, rows: bookings } = await Booking.findAndCountAll({
            where,
            include: [
                includeUser,
                { model: Book, as: 'book' },
                { model: Return, as: 'return' }
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset
        });

        res.json({
            success: true,
            data: {
                bookings,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(count / parseInt(limit))
                }
            }
        });
    } catch (error) {
        console.error('Get all bookings error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

// Flexible status update route
router.put('/:id/status', authenticate, isAdmin, async (req, res) => {
    try {
        const { status, catatan_admin } = req.body;
        const booking = await Booking.findByPk(req.params.id, {
            include: [{ model: Book, as: 'book' }, { model: BookCopy, as: 'copy' }]
        });

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking tidak ditemukan.' });
        }

        if (status === 'diambil' && booking.status !== 'diambil') {
            if (!booking.book || booking.book.stok <= 0 || !(await assignAvailableCopy(booking, booking.book))) {
                return res.status(400).json({ success: false, message: 'Tidak ada eksemplar buku yang tersedia untuk diambil.' });
            }
        } else {
            const previousStatus = booking.status;
            await booking.update({
                status: status,
                alasan_tolak: catatan_admin || booking.alasan_tolak
            });

            if (previousStatus === 'pending' && ['disetujui', 'ditolak'].includes(status)) {
                const approved = status === 'disetujui';
                await Notification.create({
                    user_id: booking.user_id,
                    judul: approved ? 'Permohonan Peminjaman Disetujui' : 'Permohonan Peminjaman Ditolak',
                    pesan: approved
                        ? `Permohonan buku "${booking.book?.judul || 'buku'}" disetujui. Jadwal ambil: ${booking.tgl_ambil}. Batas pengembalian: ${booking.tgl_kembali_rencana}.`
                        : `Permohonan buku "${booking.book?.judul || 'buku'}" ditolak. Alasan: ${catatan_admin || 'Tidak ada keterangan.'}`,
                    tipe: approved ? 'approval' : 'warning'
                });
            }
        }

        res.json({ success: true, message: `Status berhasil diubah ke ${status}.`, data: booking });
    } catch (error) {
        console.error('Status update error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

// Process return via POST (frontend compatibility)
router.post('/:id/return', authenticate, isAdmin, async (req, res) => {
    try {
        const booking = await Booking.findByPk(req.params.id, {
            include: [{ model: Book, as: 'book' }, { model: BookCopy, as: 'copy' }]
        });

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking tidak ditemukan.' });
        }

        const { kondisi_buku = 'baik', catatan = '' } = req.body;
        let denda = 0;
        if (kondisi_buku === 'rusak_ringan') denda = 10000;
        else if (kondisi_buku === 'rusak_berat') denda = 25000;
        else if (kondisi_buku === 'hilang') denda = 50000;

        await Return.create({
            booking_id: booking.id,
            tgl_kembali: new Date(),
            kondisi: kondisi_buku,
            denda: denda,
            catatan: catatan
        });

        await booking.update({ status: 'dikembalikan' });
        if (booking.copy) {
            await booking.copy.update({
                condition: normalizeReturnCondition(kondisi_buku),
                condition_notes: catatan || booking.copy.condition_notes,
                status: kondisi_buku === 'hilang' ? 'hilang' : 'tersedia'
            });
        }
        if (kondisi_buku !== 'hilang' && booking.book) {
            await booking.book.update({ stok: booking.book.stok + 1 });
        }

        res.json({ success: true, message: 'Buku berhasil dikembalikan.' });
    } catch (error) {
        console.error('Return error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

// Approve booking (admin)
router.put('/:id/approve', authenticate, isAdmin, async (req, res) => {
    try {
        const booking = await Booking.findByPk(req.params.id, {
            include: [{ model: Book, as: 'book' }, { model: BookCopy, as: 'copy' }]
        });

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking tidak ditemukan.' });
        }

        if (booking.status !== 'pending') {
            return res.status(400).json({ success: false, message: 'Booking ini sudah diproses.' });
        }

        await booking.update({ status: 'disetujui' });

        await Notification.create({
            user_id: booking.user_id,
            judul: 'Booking Disetujui! ✅',
            pesan: `Booking buku "${booking.book.judul}" telah disetujui. Silakan ambil di perpustakaan pada ${booking.tgl_ambil}.`,
            tipe: 'approval'
        });

        res.json({ success: true, message: 'Booking berhasil disetujui.', data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

// Reject booking (admin)
router.put('/:id/reject', authenticate, isAdmin, [
    body('alasan_tolak').notEmpty().withMessage('Alasan penolakan wajib diisi')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const booking = await Booking.findByPk(req.params.id, {
            include: [{ model: Book, as: 'book' }]
        });

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking tidak ditemukan.' });
        }

        if (booking.status !== 'pending') {
            return res.status(400).json({ success: false, message: 'Booking ini sudah diproses.' });
        }

        await booking.update({
            status: 'ditolak',
            alasan_tolak: req.body.alasan_tolak
        });

        await Notification.create({
            user_id: booking.user_id,
            judul: 'Booking Ditolak ❌',
            pesan: `Booking buku "${booking.book.judul}" ditolak. Alasan: ${req.body.alasan_tolak}`,
            tipe: 'warning'
        });

        res.json({ success: true, message: 'Booking berhasil ditolak.', data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

// Confirm book picked up (admin)
router.put('/:id/pickup', authenticate, isAdmin, async (req, res) => {
    try {
        const booking = await Booking.findByPk(req.params.id, {
            include: [{ model: Book, as: 'book' }]
        });

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking tidak ditemukan.' });
        }

        if (booking.status !== 'disetujui') {
            return res.status(400).json({ success: false, message: 'Booking belum disetujui atau sudah diambil.' });
        }

        if (booking.book.stok <= 0 || !(await assignAvailableCopy(booking, booking.book))) {
            return res.status(400).json({ success: false, message: 'Tidak ada eksemplar buku yang tersedia untuk diambil.' });
        }

        await Notification.create({
            user_id: booking.user_id,
            judul: 'Buku Berhasil Diambil 📚',
            pesan: `Buku "${booking.book.judul}" telah diambil. Harap dikembalikan sebelum ${booking.tgl_kembali_rencana}.`,
            tipe: 'info'
        });

        res.json({ success: true, message: 'Buku berhasil dikonfirmasi diambil.', data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

// Confirm book returned (admin)
router.put('/:id/return', authenticate, isAdmin, [
    body('kondisi').isIn(['baik', 'rusak_ringan', 'rusak_berat', 'hilang']).withMessage('Kondisi tidak valid')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const booking = await Booking.findByPk(req.params.id, {
            include: [{ model: Book, as: 'book' }, { model: BookCopy, as: 'copy' }]
        });

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking tidak ditemukan.' });
        }

        if (booking.status !== 'diambil' && booking.status !== 'terlambat') {
            return res.status(400).json({ success: false, message: 'Buku belum diambil atau sudah dikembalikan.' });
        }

        const { kondisi, catatan, denda } = req.body;

        // Create return record
        await Return.create({
            booking_id: booking.id,
            tgl_kembali: new Date(),
            kondisi,
            denda: denda || 0,
            catatan
        });

        // Update booking status
        await booking.update({ status: 'dikembalikan' });

        if (booking.copy) {
            await booking.copy.update({
                condition: normalizeReturnCondition(kondisi),
                condition_notes: catatan || booking.copy.condition_notes,
                status: kondisi === 'hilang' ? 'hilang' : 'tersedia',
                condition_updated_by: req.user.nama || req.user.username || 'Admin'
            });
        }

        // Increase book stock (unless lost)
        if (kondisi !== 'hilang') {
            await booking.book.update({ stok: booking.book.stok + 1 });
        }

        await Notification.create({
            user_id: booking.user_id,
            judul: 'Buku Dikembalikan ✅',
            pesan: `Buku "${booking.book.judul}" telah dikembalikan. Kondisi: ${kondisi}. ${denda > 0 ? `Denda: Rp ${denda}` : ''}`,
            tipe: 'info'
        });

        res.json({ success: true, message: 'Buku berhasil dikonfirmasi dikembalikan.' });
    } catch (error) {
        console.error('Return error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

// Mark as late (admin)
router.put('/:id/late', authenticate, isAdmin, async (req, res) => {
    try {
        const booking = await Booking.findByPk(req.params.id, {
            include: [{ model: Book, as: 'book' }]
        });

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking tidak ditemukan.' });
        }

        if (booking.status !== 'diambil') {
            return res.status(400).json({ success: false, message: 'Hanya buku yang sedang dipinjam yang bisa ditandai terlambat.' });
        }

        await booking.update({ status: 'terlambat' });

        await Notification.create({
            user_id: booking.user_id,
            judul: 'Peringatan: Buku Terlambat! ⚠️',
            pesan: `Buku "${booking.book.judul}" telah melewati batas waktu pengembalian. Segera kembalikan ke perpustakaan.`,
            tipe: 'warning'
        });

        res.json({ success: true, message: 'Booking ditandai terlambat.', data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

module.exports = router;

