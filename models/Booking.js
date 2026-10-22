const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Booking = sequelize.define('Booking', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
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
        allowNull: false
    },
    tgl_kembali_rencana: {
        type: DataTypes.DATEONLY,
        allowNull: true
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
    }
}, {
    tableName: 'bookings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Booking;
