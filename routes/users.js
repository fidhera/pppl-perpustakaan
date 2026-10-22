const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { User, Booking, Book } = require('../models');
const { authenticate, isAdmin } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// Complete required student profile on first sign-in.
router.put('/complete-profile', authenticate, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user || user.role !== 'siswa' || !user.is_first_login) {
            return res.status(400).json({ success: false, message: 'Akun tidak sedang memerlukan pengaturan awal.' });
        }

        const { nama, email, kelas, current_password, new_password, confirm_password } = req.body;
        if (!nama?.trim() || !email?.trim() || !kelas?.trim() || !current_password || !new_password || !confirm_password) {
            return res.status(400).json({ success: false, message: 'Semua data wajib diisi.' });
        }
        if (new_password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password baru minimal 6 karakter.' });
        }
        if (new_password !== confirm_password) {
            return res.status(400).json({ success: false, message: 'Konfirmasi password baru tidak cocok.' });
        }
        if (new_password === current_password) {
            return res.status(400).json({ success: false, message: 'Password baru tidak boleh sama dengan password saat ini.' });
        }
        if (!(await user.validatePassword(current_password))) {
            return res.status(400).json({ success: false, message: 'Password saat ini tidak sesuai.' });
        }

        user.username = user.nis;
        user.nama = nama.trim();
        user.email = email.trim();
        user.kelas = kelas.trim();
        user.password = new_password;
        user.is_first_login = false;
        await user.save();

        res.json({ success: true, message: 'Data akun berhasil dilengkapi.', data: user.toSafeJSON() });
    } catch (error) {
        console.error('Complete first-login profile error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

// Update current user profile
router.put('/profile', authenticate, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
        }

        const { name, nama, email, username } = req.body;
        const newName = name || nama;

        if (user.role === 'siswa' && username && username !== user.nis) {
            return res.status(400).json({ success: false, message: 'Username siswa mengikuti NISN dan tidak dapat diubah.' });
        }

        // Check if username already used by others
        if (username && username !== user.username) {
            const existing = await User.findOne({ where: { username } });
            if (existing) {
                return res.status(400).json({ success: false, message: 'Username sudah digunakan.' });
            }
            user.username = username;
        }

        if (newName) user.nama = newName;
        if (email !== undefined) user.email = email;

        await user.save();

        res.json({
            success: true,
            message: 'Profil berhasil diperbarui.',
            data: user.toSafeJSON()
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

// Change current user password
router.put('/change-password', authenticate, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
        }

        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Password lama dan baru wajib diisi.' });
        }

        const isValid = await user.validatePassword(oldPassword);
        if (!isValid) {
            return res.status(400).json({ success: false, message: 'Password lama tidak benar.' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'Password baru minimal 6 karakter.' });
        }

        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password berhasil diubah.'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

// Get all users (admin)
router.get('/', authenticate, isAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 50, search = '', role = '' } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const where = {};

        if (search) {
            where[Op.or] = [
                { username: { [Op.like]: `%${search}%` } },
                { nis: { [Op.like]: `%${search}%` } },
                { nama: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
                { kelas: { [Op.like]: `%${search}%` } }
            ];
        }

        if (role) {
            where.role = role;
        }

        const { count, rows: users } = await User.findAndCountAll({
            where,
            attributes: { exclude: ['password'] },
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset
        });

        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(count / parseInt(limit))
                }
            }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

// Create new user (admin)
router.post('/', authenticate, isAdmin, async (req, res) => {
    try {
        const { username, name, nama, email, role, password, kelas } = req.body;
        const finalName = name || nama;

        if (!finalName || !password) {
            return res.status(400).json({ success: false, message: 'Nama dan password wajib diisi.' });
        }

        const finalUsername = username || ('user_' + Date.now());
        // Check username uniqueness
        const existing = await User.findOne({
            where: {
                [Op.or]: [
                    { username: finalUsername },
                    { nis: finalUsername }
                ]
            }
        });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Username sudah digunakan.' });
        }

        const user = await User.create({
            username: finalUsername,
            nis: finalUsername,
            nama: finalName,
            email: email || null,
            role: role || 'siswa',
            kelas: kelas || '-',
            password
        });

        res.status(201).json({
            success: true,
            message: 'User berhasil ditambahkan.',
            data: user.toSafeJSON()
        });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

// Update user (admin)
router.put('/:id', authenticate, isAdmin, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
        }

        const { username, name, nama, email, role, kelas, is_active } = req.body;
        const finalName = name || nama;

        if (username && username !== user.username) {
            const existing = await User.findOne({ where: { username } });
            if (existing) {
                return res.status(400).json({ success: false, message: 'Username sudah digunakan.' });
            }
            user.username = username;
        }

        if (finalName) user.nama = finalName;
        if (email !== undefined) user.email = email;
        if (role) user.role = role;
        if (kelas) user.kelas = kelas;
        if (is_active !== undefined) user.is_active = is_active;

        await user.save();

        res.json({
            success: true,
            message: 'User berhasil diperbarui.',
            data: user.toSafeJSON()
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

// Delete user (admin)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
        }

        if (user.id === req.user.id) {
            return res.status(400).json({ success: false, message: 'Tidak dapat menghapus akun Anda sendiri.' });
        }

        await user.destroy();

        res.json({
            success: true,
            message: 'User berhasil dihapus.'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

// Toggle user active status (admin)
router.put('/:id/toggle-active', authenticate, isAdmin, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
        }

        if (user.id === req.user.id) {
            return res.status(400).json({ success: false, message: 'Tidak bisa menonaktifkan akun sendiri.' });
        }

        await user.update({ is_active: !user.is_active });

        res.json({
            success: true,
            message: `Akun ${user.nama} berhasil ${user.is_active ? 'diaktifkan' : 'dinonaktifkan'}.`,
            data: user.toSafeJSON()
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

// Reset user password (admin)
router.put('/:id/reset-password', authenticate, isAdmin, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
        }

        const newPass = req.body.password || user.username || user.nis || '123456';
        user.password = newPass;
        await user.save();

        res.json({
            success: true,
            message: `Password ${user.nama} berhasil direset.`
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

// Get user detail with booking history (admin)
router.get('/:id', authenticate, isAdmin, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password'] },
            include: [{
                model: Booking,
                as: 'bookings',
                include: [{ model: Book, as: 'book' }],
                order: [['created_at', 'DESC']],
                limit: 10
            }]
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
        }

        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

module.exports = router;
