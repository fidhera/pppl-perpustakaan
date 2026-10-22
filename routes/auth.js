const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { User } = require('../models');
const { authenticate } = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/upload');

// Register
router.post('/register', [
    body('nis').notEmpty().withMessage('NIS wajib diisi'),
    body('nama').notEmpty().withMessage('Nama wajib diisi'),
    body('kelas').notEmpty().withMessage('Kelas wajib diisi'),
    body('password').isLength({ min: 6 }).withMessage('Password minimal 6 karakter')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { nis, nama, kelas, email, password } = req.body;

        // Check if NIS already exists
        const existingUser = await User.findOne({ where: { nis } });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'NIS sudah terdaftar.'
            });
        }

        const user = await User.create({
            nis, nama, kelas, email, password, role: 'siswa', is_first_login: false
        });

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.status(201).json({
            success: true,
            message: 'Registrasi berhasil!',
            data: { user: user.toSafeJSON(), token }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

// Login
router.post('/login', [
    body('password').notEmpty().withMessage('Password wajib diisi')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const identifier = req.body.username || req.body.nis || req.body.identifier;
        const { password } = req.body;

        if (!identifier) {
            return res.status(400).json({
                success: false,
                message: 'Username atau NIS wajib diisi.'
            });
        }

        const cleanIdentifier = String(identifier).trim();
        const user = await User.findOne({
            where: {
                [Op.or]: [
                    { username: cleanIdentifier },
                    { nis: cleanIdentifier }
                ]
            }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Username/NIS atau password salah.'
            });
        }

        if (!user.is_active) {
            return res.status(403).json({
                success: false,
                message: 'Akun Anda telah dinonaktifkan. Hubungi admin.'
            });
        }

        const isValid = await user.validatePassword(password);
        if (!isValid) {
            return res.status(401).json({
                success: false,
                message: 'Username/NIS atau password salah.'
            });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.json({
            success: true,
            message: 'Login berhasil!',
            data: { user: user.toSafeJSON(), token }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

// Get current user profile
router.get('/profile', authenticate, async (req, res) => {
    try {
        res.json({
            success: true,
            data: req.user.toSafeJSON()
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

// Update profile
router.put('/profile', authenticate, [
    body('nama').optional().notEmpty().withMessage('Nama tidak boleh kosong'),
    body('kelas').optional().notEmpty().withMessage('Kelas tidak boleh kosong')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { nama, kelas, email } = req.body;
        const updateData = {};
        if (nama) updateData.nama = nama;
        if (kelas) updateData.kelas = kelas;
        if (email !== undefined) updateData.email = email;

        await req.user.update(updateData);

        res.json({
            success: true,
            message: 'Profil berhasil diperbarui.',
            data: req.user.toSafeJSON()
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

// Change password
router.put('/change-password', authenticate, [
    body('current_password').notEmpty().withMessage('Password lama wajib diisi'),
    body('new_password').isLength({ min: 6 }).withMessage('Password baru minimal 6 karakter')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { current_password, new_password } = req.body;

        const isValid = await req.user.validatePassword(current_password);
        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: 'Password lama tidak sesuai.'
            });
        }

        await req.user.update({ password: new_password });

        res.json({
            success: true,
            message: 'Password berhasil diubah.'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

module.exports = router;

