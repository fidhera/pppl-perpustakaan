const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LandingSetting = sequelize.define('LandingSetting', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    key: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    value: {
        type: DataTypes.TEXT('long'),
        allowNull: false
    }
}, {
    tableName: 'landing_settings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = LandingSetting;
