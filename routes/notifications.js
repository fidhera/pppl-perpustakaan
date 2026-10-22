const express = require('express');
const router = express.Router();
const { Notification } = require('../models');
const { authenticate } = require('../middleware/auth');
const { Op } = require('sequelize');

// Get my notifications
router.get('/', authenticate, async (req, res) => {
    try {
        const { page = 1, limit = 20, unread_only = false } = req.query;
        const where = { user_id: req.user.id };
        if (unread_only === 'true') where.is_read = false;

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { count, rows: notifications } = await Notification.findAndCountAll({
            where,
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset
        });

        const unreadCount = await Notification.count({
            where: { user_id: req.user.id, is_read: false }
        });

        res.json({
            success: true,
            data: {
                notifications,
                unreadCount,
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

// Mark notification as read
router.put('/:id/read', authenticate, async (req, res) => {
    try {
        const notification = await Notification.findOne({
            where: { id: req.params.id, user_id: req.user.id }
        });

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notifikasi tidak ditemukan.' });
        }

        await notification.update({ is_read: true });
        res.json({ success: true, message: 'Notifikasi ditandai sudah dibaca.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

// Mark all notifications as read
router.put('/read-all', authenticate, async (req, res) => {
    try {
        await Notification.update(
            { is_read: true },
            { where: { user_id: req.user.id, is_read: false } }
        );
        res.json({ success: true, message: 'Semua notifikasi ditandai sudah dibaca.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

module.exports = router;
