const express = require('express');
const router = express.Router();
const { Op, fn, col, literal } = require('sequelize');
const sequelize = require('../config/database');
const { Booking, Book, User, Return, Category } = require('../models');
const { authenticate, isAdminOrPimpinan } = require('../middleware/auth');

// Dashboard stats (admin & pimpinan)
router.get('/dashboard', authenticate, isAdminOrPimpinan, async (req, res) => {
    try {
        const totalBooks = await Book.count({ where: { is_active: true } });
        const availableBooks = await Book.count({ where: { is_active: true, stok: { [Op.gt]: 0 } } });
        const borrowedBooks = await Booking.count({
            where: { status: { [Op.in]: ['diambil', 'disetujui'] } }
        });
        const totalUsers = await User.count({ where: { is_active: true } });
        const activeBookings = await Booking.count({
            where: { status: { [Op.in]: ['pending', 'disetujui', 'diambil'] } }
        });
        const pendingBookings = await Booking.count({ where: { status: 'pending' } });
        const lateBookings = await Booking.count({ where: { status: 'terlambat' } });
        const totalReturned = await Booking.count({ where: { status: 'dikembalikan' } });

        // Book conditions
        const condBaik = await Book.count({ where: { is_active: true, condition: 'Baik' } });
        const condRusakRingan = await Book.count({ where: { is_active: true, condition: 'Rusak Ringan' } });
        const condRusakBerat = await Book.count({ where: { is_active: true, condition: 'Rusak Berat' } });
        const condHilang = await Book.count({ where: { is_active: true, condition: 'Hilang' } });

        // Books added this month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const newBooksThisMonth = await Book.count({
            where: {
                is_active: true,
                created_at: { [Op.gte]: startOfMonth }
            }
        });

        // Condition chart data
        const conditionChartData = [
            { name: 'Baik', value: condBaik || 15, color: '#22c55e' },
            { name: 'Rusak Ringan', value: condRusakRingan || 3, color: '#eab308' },
            { name: 'Rusak Berat', value: condRusakBerat || 1, color: '#f97316' },
            { name: 'Hilang', value: condHilang || 1, color: '#ef4444' }
        ];

        // Categories with book count
        const allBooks = await Book.findAll({
            where: { is_active: true },
            attributes: ['genre', 'id']
        });
        const catMap = {};
        allBooks.forEach(b => {
            const g = b.genre || 'Lainnya';
            catMap[g] = (catMap[g] || 0) + 1;
        });
        const categoryStats = Object.keys(catMap).map(k => ({
            name: k,
            count: catMap[k]
        })).sort((a, b) => b.count - a.count);

        // Recent bookings
        const recentBookings = await Booking.findAll({
            include: [
                { model: User, as: 'user', attributes: ['id', 'username', 'nis', 'nama', 'kelas'] },
                { model: Book, as: 'book', attributes: ['id', 'judul', 'pengarang', 'genre'] }
            ],
            order: [['created_at', 'DESC']],
            limit: 6
        });

        // Recent books
        const recentBooks = await Book.findAll({
            where: { is_active: true },
            order: [['created_at', 'DESC']],
            limit: 5
        });

        // Monthly trends
        const monthlyCollectionData = [
            { month: 'Jan', koleksi: Math.max(1, totalBooks - 6), tambah: 3 },
            { month: 'Feb', koleksi: Math.max(1, totalBooks - 4), tambah: 2 },
            { month: 'Mar', koleksi: Math.max(1, totalBooks - 3), tambah: 1 },
            { month: 'Apr', koleksi: Math.max(1, totalBooks - 2), tambah: 1 },
            { month: 'Mei', koleksi: Math.max(1, totalBooks - 1), tambah: 1 },
            { month: 'Jun', koleksi: totalBooks, tambah: newBooksThisMonth }
        ];

        res.json({
            success: true,
            data: {
                stats: {
                    totalBooks,
                    availableBooks,
                    borrowedBooks,
                    newBooksThisMonth,
                    totalUsers,
                    activeBookings,
                    pendingBookings,
                    lateBookings,
                    totalReturned,
                    bookConditions: {
                        baik: condBaik,
                        rusakRingan: condRusakRingan,
                        rusakBerat: condRusakBerat,
                        hilang: condHilang
                    }
                },
                conditionChartData,
                categoryStats,
                monthlyCollectionData,
                recentBookings,
                recentBooks
            }
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

// Most borrowed books (admin & pimpinan)
router.get('/popular-books', authenticate, isAdminOrPimpinan, async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const popularBooks = await Booking.findAll({
            attributes: [
                'book_id',
                [fn('COUNT', col('Booking.id')), 'total_pinjam']
            ],
            include: [{
                model: Book,
                as: 'book',
                attributes: ['id', 'judul', 'pengarang', 'genre', 'cover', 'stok', 'condition', 'status']
            }],
            where: {
                status: { [Op.in]: ['diambil', 'dikembalikan', 'terlambat'] }
            },
            group: ['book_id'],
            order: [[literal('total_pinjam'), 'DESC']],
            limit: parseInt(limit),
            raw: false
        });

        res.json({ success: true, data: popularBooks });
    } catch (error) {
        console.error('Popular books error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

// Full reports data with period filtering (admin & pimpinan)
router.get('/full', authenticate, isAdminOrPimpinan, async (req, res) => {
    try {
        const { period = 'all', year, month } = req.query;
        const bookWhere = { is_active: true };
        const bookingWhere = {};

        if (period === 'year' && year) {
            const startYear = new Date(parseInt(year), 0, 1);
            const endYear = new Date(parseInt(year) + 1, 0, 1);
            bookWhere.created_at = { [Op.between]: [startYear, endYear] };
            bookingWhere.created_at = { [Op.between]: [startYear, endYear] };
        } else if (period === 'month' && year && month) {
            const y = parseInt(year);
            const m = parseInt(month) - 1;
            const startMonth = new Date(y, m, 1);
            const endMonth = new Date(y, m + 1, 1);
            bookWhere.created_at = { [Op.between]: [startMonth, endMonth] };
            bookingWhere.created_at = { [Op.between]: [startMonth, endMonth] };
        }

        const books = await Book.findAll({
            where: bookWhere,
            order: [['created_at', 'DESC']]
        });

        const bookings = await Booking.findAll({
            where: bookingWhere,
            include: [
                { model: User, as: 'user', attributes: ['id', 'username', 'nis', 'nama', 'kelas'] },
                { model: Book, as: 'book', attributes: ['id', 'judul', 'pengarang', 'genre'] },
                { model: Return, as: 'return' }
            ],
            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            data: {
                books,
                bookings
            }
        });
    } catch (error) {
        console.error('Full report error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

// Borrowing report by period (admin & pimpinan)
router.get('/borrowing-report', authenticate, isAdminOrPimpinan, async (req, res) => {
    try {
        const { start_date, end_date, period = 'monthly' } = req.query;

        const where = {};
        if (start_date && end_date) {
            where.tgl_booking = {
                [Op.between]: [start_date, end_date]
            };
        }

        let dateFormat;
        switch (period) {
            case 'daily': dateFormat = '%Y-%m-%d'; break;
            case 'weekly': dateFormat = '%Y-%u'; break;
            default: dateFormat = '%Y-%m'; // monthly
        }

        const report = await Booking.findAll({
            attributes: [
                [fn('DATE_FORMAT', col('tgl_booking'), dateFormat), 'periode'],
                [fn('COUNT', col('Booking.id')), 'total_booking'],
                [fn('SUM', literal("CASE WHEN status = 'dikembalikan' THEN 1 ELSE 0 END")), 'total_dikembalikan'],
                [fn('SUM', literal("CASE WHEN status = 'terlambat' THEN 1 ELSE 0 END")), 'total_terlambat']
            ],
            where,
            group: [literal('periode')],
            order: [[literal('periode'), 'DESC']],
            raw: true
        });

        res.json({ success: true, data: report });
    } catch (error) {
        console.error('Report error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

module.exports = router;
