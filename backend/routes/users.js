const express = require('express');
const router = express.Router();
const User = require('../models/User');
const FoodListing = require('../models/FoodListing');
const DonationHistory = require('../models/DonationHistory');
const { protect } = require('../middleware/auth');

router.get('/profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -notifications');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const listings = await FoodListing.find({ donor: req.params.id }).sort('-createdAt').limit(6);
    const history = await DonationHistory.find({ $or: [{ donor: req.params.id }, { receiver: req.params.id }] }).limit(10);
    res.json({ success: true, data: { user, listings, history } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/dashboard/stats', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const query = req.user.role === 'donor' ? { donor: userId } : { receiver: userId };
    const [listings, history, unreadNotifs] = await Promise.all([
      FoodListing.find({ donor: userId }).sort('-createdAt').limit(10),
      DonationHistory.find(query).populate('foodListing', 'title category images').sort('-completedAt').limit(10),
      req.user.notifications ? req.user.notifications.filter(n => !n.read).length : 0
    ]);
    const stats = {
      totalListings: await FoodListing.countDocuments({ donor: userId }),
      activeListing: await FoodListing.countDocuments({ donor: userId, status: 'available' }),
      totalDonations: req.user.donationCount,
      totalReceived: req.user.receivedCount,
      mealsProvided: req.user.donationCount * 4,
      co2Saved: (req.user.donationCount * 2.5).toFixed(1),
      unreadNotifs
    };
    res.json({ success: true, data: { stats, listings, history } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
