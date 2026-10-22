const express = require('express');
const router = express.Router();
 const { Category, Book } = require('../models');
 const { authenticate, isAdmin } = require('../middleware/auth');
 const { body, validationResult } = require('express-validator');

// Get all categories with book count
router.get('/', async (req, res) => {
    try {
        const categories = await Category.findAll({
            order: [['name', 'ASC']]
        });

        // Get book counts per genre/category
        const books = await Book.findAll({
            attributes: ['genre'],
            where: { is_active: true }
        });

        const countsMap = {};
        books.forEach(b => {
            const cat = b.genre;
            countsMap[cat] = (countsMap[cat] || 0) + 1;
        });

        const data = categories.map(c => {
            const json = c.toJSON();
            json.bookCount = countsMap[c.name] || 0;
            return json;
        });

        res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

// Get single category
router.get('/:id', async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan.' });
        }
        res.json({ success: true, data: category });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

// Create category (admin only)
router.post('/', authenticate, isAdmin, [
    body('name').notEmpty().withMessage('Nama kategori wajib diisi'),
    body('code').notEmpty().withMessage('Kode kategori wajib diisi')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { code, name, description } = req.body;

        const existing = await Category.findOne({ where: { code } });
        if (existing) {
            return res.status(400).json({ success: false, message: `Kode kategori ${code} sudah digunakan.` });
        }

        const category = await Category.create({ code, name, description });
        res.status(201).json({
            success: true,
            message: 'Kategori berhasil ditambahkan.',
            data: category
        });
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

// Update category (admin only)
router.put('/:id', authenticate, isAdmin, [
    body('name').notEmpty().withMessage('Nama kategori wajib diisi')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const category = await Category.findByPk(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan.' });
        }

        const { code, name, description } = req.body;
        await category.update({
            code: code || category.code,
            name: name || category.name,
            description: description !== undefined ? description : category.description
        });

        res.json({
            success: true,
            message: 'Kategori berhasil diperbarui.',
            data: category
        });
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

// Delete category (admin only)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan.' });
        }

        await category.destroy();
        res.json({
            success: true,
            message: 'Kategori berhasil dihapus.'
        });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

module.exports = router;
