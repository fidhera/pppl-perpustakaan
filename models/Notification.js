const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
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
    judul: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    pesan: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    tipe: {
        type: DataTypes.ENUM('booking', 'approval', 'reminder', 'info', 'warning'),
        defaultValue: 'info'
    },
    is_read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    link: {
        type: DataTypes.STRING(255),
        allowNull: true
    }
}, {
    tableName: 'notifications',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Notification;
