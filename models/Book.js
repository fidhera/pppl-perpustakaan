const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Book = sequelize.define('Book', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    judul: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    pengarang: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    penerbit: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    tahun_terbit: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    kode_buku: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    isbn: {
        type: DataTypes.STRING(20),
        allowNull: true,
        unique: true
    },
    genre: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    stok: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
            min: 0
        }
    },
    condition: {
        type: DataTypes.ENUM('Baik', 'Rusak Ringan', 'Rusak Berat', 'Hilang'),
        defaultValue: 'Baik'
    },
    status: {
        type: DataTypes.ENUM('Tersedia', 'Dipinjam', 'Hilang'),
        defaultValue: 'Tersedia'
    },
    condition_notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    condition_updated_by: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    cover: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    deskripsi: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    lokasi_rak: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'books',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Book;
