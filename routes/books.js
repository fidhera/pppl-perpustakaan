const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { body, validationResult, query } = require('express-validator');
const { Book, BookCopy } = require('../models');
const { authenticate, isAdmin } = require('../middleware/auth');
const { uploadCover } = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

function copyCode(book, number) {
    const prefix = (book.kode_buku || `BK-${book.id}`).replace(/[^a-z0-9-]/gi, '-');
    return `${prefix}-${String(number).padStart(3, '0')}`;
}

async function ensureAvailableCopies(book) {
    const availableCount = await BookCopy.count({ where: { book_id: book.id, status: 'tersedia' } });
    const missing = Math.max(0, Number(book.stok) - availableCount);
    if (!missing) return;

    const copyCount = await BookCopy.count({ where: { book_id: book.id } });
    const copies = Array.from({ length: missing }, (_, index) => ({
        book_id: book.id,
        kode_eksemplar: copyCode(book, copyCount + index + 1),
        condition: book.condition || 'Baik',
        condition_notes: book.condition_notes || null,
        status: 'tersedia',
        condition_updated_by: book.condition_updated_by || 'Admin'
    }));
    await BookCopy.bulkCreate(copies, { ignoreDuplicates: true });
}

async function updateBookConditionSummary(bookId) {
    const copies = await BookCopy.findAll({ where: { book_id: bookId }, attributes: ['condition'] });
    if (!copies.length) return;
    const totals = copies.reduce((counts, copy) => {
        counts[copy.condition] = (counts[copy.condition] || 0) + 1;
        return counts;
    }, {});
    const condition = Object.entries(totals).sort((a, b) => b[1] - a[1])[0][0];
    await Book.update({ condition }, { where: { id: bookId } });
}

// Get all books (public - with search, filter, pagination)
router.get('/', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 12,
            search = '',
            genre = '',
            status = '',
            condition = '',
            sort = 'newest'
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const where = { is_active: true };

        // Search by title, author, isbn, or kode_buku
        if (search) {
            where[Op.or] = [
                { judul: { [Op.like]: `%${search}%` } },
                { pengarang: { [Op.like]: `%${search}%` } },
                { isbn: { [Op.like]: `%${search}%` } },
                { kode_buku: { [Op.like]: `%${search}%` } }
            ];
        }

        // Filter by genre/category
        if (genre && genre !== 'ALL_CATEGORIES') {
            where.genre = genre;
        }

        // Filter by condition
        if (condition && condition !== 'ALL_CONDITIONS' && condition !== 'all') {
            where.condition = condition;
        }

        // Filter by status
        if (status && status !== 'ALL_STATUS') {
            if (status === 'available') {
                where.stok = { [Op.gt]: 0 };
            } else if (status === 'unavailable') {
                where.stok = 0;
            } else {
                where.status = status;
            }
        }

        // Sort
        let order;
        switch (sort) {
            case 'title_asc': order = [['judul', 'ASC']]; break;
            case 'title_desc': order = [['judul', 'DESC']]; break;
            case 'oldest': order = [['created_at', 'ASC']]; break;
            default: order = [['created_at', 'DESC']]; // newest
        }

        const { count, rows: rawBooks } = await Book.findAndCountAll({
            where,
            order,
            limit: parseInt(limit),
            offset
        });

        const books = await Promise.all(rawBooks.map(async (book) => {
            const b = book.toJSON();
            const copies = await BookCopy.findAll({
                where: { book_id: book.id },
                attributes: ['status', 'condition']
            });
            const totalStock = b.stok || copies.length || 1;
            const tersedia = copies.length > 0
                ? copies.filter(c => c.status === 'tersedia' && c.condition !== 'Hilang').length
                : (b.status === 'Tersedia' ? totalStock : 0);
            const dipinjam = copies.length > 0
                ? copies.filter(c => c.status === 'dipinjam').length
                : (b.status === 'Dipinjam' ? 1 : 0);

            b.stok_total = totalStock;
            b.stok_tersedia = tersedia;
            b.stok_dipinjam = dipinjam;
            return b;
        }));

        res.json({
            success: true,
            data: books,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get books error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

// Get all genres (public)
router.get('/genres', async (req, res) => {
    try {
        const genres = await Book.findAll({
            attributes: ['genre'],
            where: { is_active: true },
            group: ['genre'],
            order: [['genre', 'ASC']]
        });
        res.json({
            success: true,
            data: genres.map(g => g.genre)
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

// Inventory and condition are tracked independently for every physical copy.
router.get('/inventory/copies', authenticate, async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'pimpinan') {
            return res.status(403).json({ success: false, message: 'Akses ditolak.' });
        }
        const books = await Book.findAll({ where: { is_active: true } });
        for (const book of books) await ensureAvailableCopies(book);
        const copies = await BookCopy.findAll({
            include: [{ model: Book, as: 'book' }],
            order: [['book_id', 'ASC'], ['kode_eksemplar', 'ASC']]
        });
        res.json({ success: true, data: copies });
    } catch (error) {
        console.error('Load book copies error:', error);
        res.status(500).json({ success: false, message: 'Gagal memuat data eksemplar buku.' });
    }
});

router.put('/inventory/copies/:copyId/condition', authenticate, async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'pimpinan') {
            return res.status(403).json({ success: false, message: 'Akses ditolak.' });
        }
        const { condition, notes = '' } = req.body;
        const validConditions = ['Baik', 'Rusak Ringan', 'Rusak Berat', 'Hilang'];
        if (!validConditions.includes(condition)) {
            return res.status(400).json({ success: false, message: 'Kondisi buku tidak valid.' });
        }
        const copy = await BookCopy.findByPk(req.params.copyId);
        if (!copy) return res.status(404).json({ success: false, message: 'Eksemplar buku tidak ditemukan.' });

        await copy.update({
            condition,
            condition_notes: notes.trim() || null,
            status: condition === 'Hilang' ? 'hilang' : (copy.status === 'hilang' ? 'tersedia' : copy.status),
            condition_updated_by: req.user.nama || req.user.username || 'Admin'
        });
        await updateBookConditionSummary(copy.book_id);
        res.json({ success: true, message: 'Kondisi eksemplar berhasil diperbarui.', data: copy });
    } catch (error) {
        console.error('Update copy condition error:', error);
        res.status(500).json({ success: false, message: 'Gagal memperbarui kondisi eksemplar.' });
    }
});

// Get single book (public)
router.get('/:id', async (req, res) => {
    try {
        const book = await Book.findByPk(req.params.id);
        if (!book || !book.is_active) {
            return res.status(404).json({
                success: false,
                message: 'Buku tidak ditemukan.'
            });
        }
        res.json({ success: true, data: book });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

// Create book (admin only)
router.post('/', authenticate, isAdmin, uploadCover.single('cover'), [
    body('judul').notEmpty().withMessage('Judul wajib diisi'),
    body('pengarang').notEmpty().withMessage('Pengarang wajib diisi'),
    body('genre').notEmpty().withMessage('Genre wajib diisi'),
    body('stok').isInt({ min: 0 }).withMessage('Stok harus berupa angka positif')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const bookData = {
            judul: req.body.judul,
            pengarang: req.body.pengarang,
            penerbit: req.body.penerbit,
            tahun_terbit: req.body.tahun_terbit,
            isbn: req.body.isbn,
            kode_buku: req.body.kode_buku || req.body.code,
            genre: req.body.genre || req.body.category,
            stok: req.body.stok !== undefined ? parseInt(req.body.stok) : 1,
            condition: req.body.condition || 'Baik',
            status: req.body.status || 'Tersedia',
            condition_notes: req.body.condition_notes || req.body.notes,
            condition_updated_by: req.user.nama || req.user.username || 'Admin',
            deskripsi: req.body.deskripsi,
            lokasi_rak: req.body.lokasi_rak || req.body.location
        };

        if (req.file) {
            bookData.cover = '/uploads/covers/' + req.file.filename;
        }

        const book = await Book.create(bookData);
        await ensureAvailableCopies(book);

        res.status(201).json({
            success: true,
            message: 'Buku berhasil ditambahkan.',
            data: book
        });
    } catch (error) {
        console.error('Create book error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

// Update book (admin only)
router.put('/:id', authenticate, isAdmin, uploadCover.single('cover'), async (req, res) => {
    try {
        const book = await Book.findByPk(req.params.id);
        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Buku tidak ditemukan.'
            });
        }

        const updateData = {};
        const fields = ['judul', 'pengarang', 'penerbit', 'tahun_terbit', 'isbn', 'kode_buku', 'genre', 'stok', 'condition', 'status', 'condition_notes', 'condition_updated_by', 'deskripsi', 'lokasi_rak'];
        fields.forEach(field => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });

        if (req.file) {
            if (book.cover) {
                const oldPath = path.join(__dirname, '..', book.cover);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
            updateData.cover = '/uploads/covers/' + req.file.filename;
        }

        await book.update(updateData);

        if (req.body.stok !== undefined) {
            const desiredStock = Math.max(0, parseInt(req.body.stok, 10) || 0);
            const availableCopies = await BookCopy.findAll({ where: { book_id: book.id, status: 'tersedia' }, order: [['id', 'DESC']] });
            if (desiredStock > availableCopies.length) {
                book.stok = desiredStock;
                await ensureAvailableCopies(book);
            } else if (desiredStock < availableCopies.length) {
                const removeIds = availableCopies.slice(0, availableCopies.length - desiredStock).map(copy => copy.id);
                await BookCopy.destroy({ where: { id: removeIds } });
            }
            await book.update({ stok: desiredStock });
        }

        res.json({
            success: true,
            message: 'Buku berhasil diperbarui.',
            data: book
        });
    } catch (error) {
        console.error('Update book error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

// Delete book (admin only)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
    try {
        const book = await Book.findByPk(req.params.id);
        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Buku tidak ditemukan.'
            });
        }

        await book.update({ is_active: false });
        res.json({
            success: true,
            message: 'Buku berhasil dinonaktifkan.'
        });
    } catch (error) {
        console.error('Delete book error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

module.exports = router;
