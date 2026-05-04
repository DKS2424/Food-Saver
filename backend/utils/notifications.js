const User = require('../models/User');

const sendNotification = async (userId, message, type = 'info', link = '', io = null) => {
  try {
    const notification = { message, type, read: false, createdAt: new Date(), link };
    await User.findByIdAndUpdate(userId, { $push: { notifications: { $each: [notification], $position: 0 } } });
    if (io) {
      io.to(`user-${userId}`).emit('notification', notification);
    }
  } catch (err) {
    console.error('Notification error:', err);
  }
};

module.exports = { sendNotification };
