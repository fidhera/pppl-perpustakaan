const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING(50),
        allowNull: true,
        unique: true
    },
    nis: {
        type: DataTypes.STRING(20),
        allowNull: true,
        unique: true
    },
    nama: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    kelas: {
        type: DataTypes.STRING(20),
        allowNull: true,
        defaultValue: '-'
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('admin', 'pimpinan', 'siswa'),
        defaultValue: 'siswa'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    is_first_login: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    avatar: {
        type: DataTypes.STRING(255),
        allowNull: true
    }
}, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        }
    }
});

User.prototype.validatePassword = async function (password) {
    return bcrypt.compare(password, this.password);
};

User.prototype.toSafeJSON = function () {
    const values = { ...this.get() };
    delete values.password;
    return values;
};

module.exports = User;
