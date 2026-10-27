const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Booking = sequelize.define('Booking', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    kode_booking: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    book_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'books',
            key: 'id'
        }
    },
    book_copy_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'book_copies', key: 'id' }
    },
    tgl_booking: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    tgl_ambil: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    tgl_kembali_rencana: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'disetujui', 'ditolak', 'diambil', 'dikembalikan', 'terlambat'),
        defaultValue: 'pending'
    },
    alasan_tolak: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    catatan: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    approved_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'id' }
    },
    approved_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    picked_up_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'bookings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
        beforeValidate: (booking) => {
            if (!booking.kode_booking) {
                const now = new Date();
                const y = now.getFullYear();
                const m = String(now.getMonth() + 1).padStart(2, '0');
                const d = String(now.getDate()).padStart(2, '0');
                const rand = Math.floor(1000 + Math.random() * 9000);
                booking.kode_booking = `BK-${y}${m}${d}-${rand}`;
            }
        }
    }
});

module.exports = Booking;
