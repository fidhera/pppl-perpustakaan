const sequelize = require('../config/database');
const User = require('./User');
const Book = require('./Book');
const BookCopy = require('./BookCopy');
const Booking = require('./Booking');
const Return = require('./Return');
const Notification = require('./Notification');
const Category = require('./Category');

// Define associations
// User - Booking (One to Many)
User.hasMany(Booking, { foreignKey: 'user_id', as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Book - Booking (One to Many)
Book.hasMany(Booking, { foreignKey: 'book_id', as: 'bookings' });
Booking.belongsTo(Book, { foreignKey: 'book_id', as: 'book' });

// Booking - Return (One to One)
Booking.hasOne(Return, { foreignKey: 'booking_id', as: 'return' });
Return.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });

// User - Notification (One to Many)
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

const LandingSetting = require('./LandingSetting');

Book.hasMany(BookCopy, { foreignKey: 'book_id', as: 'copies' });
BookCopy.belongsTo(Book, { foreignKey: 'book_id', as: 'book' });
BookCopy.hasMany(Booking, { foreignKey: 'book_copy_id', as: 'bookings' });
Booking.belongsTo(BookCopy, { foreignKey: 'book_copy_id', as: 'copy' });

module.exports = {
    sequelize,
    User,
    Book,
    Booking,
    Return,
    Notification,
    Category,
    BookCopy,
    LandingSetting
};

