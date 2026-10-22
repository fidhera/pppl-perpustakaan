const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BookCopy = sequelize.define('BookCopy', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    book_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'books', key: 'id' }
    },
    kode_eksemplar: {
        type: DataTypes.STRING(80),
        allowNull: false,
        unique: true
    },
    condition: {
        type: DataTypes.ENUM('Baik', 'Rusak Ringan', 'Rusak Berat', 'Hilang'),
        allowNull: false,
        defaultValue: 'Baik'
    },
    condition_notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('tersedia', 'dipinjam', 'hilang'),
        allowNull: false,
        defaultValue: 'tersedia'
    },
    condition_updated_by: {
        type: DataTypes.STRING(100),
        allowNull: true
    }
}, {
    tableName: 'book_copies',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = BookCopy;
