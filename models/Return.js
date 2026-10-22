const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Return = sequelize.define('Return', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    booking_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
            model: 'bookings',
            key: 'id'
        }
    },
    tgl_kembali: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    kondisi: {
        type: DataTypes.ENUM('baik', 'rusak_ringan', 'rusak_berat', 'hilang'),
        defaultValue: 'baik'
    },
    denda: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    catatan: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'returns',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Return;
