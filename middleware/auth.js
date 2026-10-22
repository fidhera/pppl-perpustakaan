const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Verify JWT token
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Token akses diperlukan. Silakan login terlebih dahulu.'
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User tidak ditemukan.'
            });
        }

        if (!user.is_active) {
            return res.status(403).json({
                success: false,
                message: 'Akun Anda telah dinonaktifkan. Hubungi admin.'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token telah kadaluarsa. Silakan login kembali.'
            });
        }
        return res.status(401).json({
            success: false,
            message: 'Token tidak valid.'
        });
    }
};

// Check if user is admin
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Akses ditolak. Hanya admin yang dapat mengakses fitur ini.'
        });
    }
    next();
};

// Check if user is admin or pimpinan
const isAdminOrPimpinan = (req, res, next) => {
    if (req.user.role !== 'admin' && req.user.role !== 'pimpinan') {
        return res.status(403).json({
            success: false,
            message: 'Akses ditolak. Hanya admin atau pimpinan yang dapat mengakses fitur ini.'
        });
    }
    next();
};

// Check if user is siswa
const isSiswa = (req, res, next) => {
    if (req.user.role !== 'siswa') {
        return res.status(403).json({
            success: false,
            message: 'Akses ditolak. Fitur ini hanya untuk siswa.'
        });
    }
    next();
};

module.exports = { authenticate, isAdmin, isAdminOrPimpinan, isSiswa };
