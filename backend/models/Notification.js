const mongoose = require('mongoose');

const Notification = require('../models/Notification');
const User = require('../models/User');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['request-received', 'request-approved', 'request-rejected', 'food-expiring', 'food-claimed', 'system'],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  link: { type: String },
  meta: { type: Object }
}, { timestamps: true });



module.exports = mongoose.model('Notification', notificationSchema);



// 🔥 get all NGOs / receivers
const receivers = await User.find({ role: 'receiver' });

// 🔥 create notification for each
const notifications = receivers.map(u => ({
  user: u._id,
  type: 'system',
  title: 'New Food Available 🍱',
  message: `${newListing.title} is available in ${newListing.location?.city}`,
  link: `/food/${newListing._id}`, // clickable later
}));

await Notification.insertMany(notifications);