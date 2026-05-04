const express = require('express');
const router = express.Router();
const User = require('../models/User');
const FoodListing = require('../models/FoodListing');
const Request = require('../models/Request');
const DonationHistory = require('../models/DonationHistory');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/stats', async (req, res) => {
  try {
    const [users, listings, requests, donations] = await Promise.all([
      User.countDocuments(), FoodListing.countDocuments(),
      Request.countDocuments(), DonationHistory.countDocuments()
    ]);
    const [donors, receivers, available, claimed] = await Promise.all([
      User.countDocuments({ role: 'donor' }), User.countDocuments({ role: 'receiver' }),
      FoodListing.countDocuments({ status: 'available' }), FoodListing.countDocuments({ status: 'claimed' })
    ]);
    res.json({ success: true, data: { users, listings, requests, donations, donors, receivers, available, claimed, mealsProvided: donations * 4 } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) query.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];
    const total = await User.countDocuments(query);
    const users = await User.find(query).select('-password').sort('-createdAt').skip((page-1)*limit).limit(parseInt(limit));
    res.json({ success: true, data: users, pagination: { total, page: parseInt(page), pages: Math.ceil(total/limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/users/:id/toggle', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/listings', async (req, res) => {
  try {
    const listings = await FoodListing.find().populate('donor', 'name email').sort('-createdAt').limit(50);
    res.json({ success: true, data: listings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/listings/:id', async (req, res) => {
  try {
    await FoodListing.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


router.get('/admin/listings', async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const listings = await Listing.find()
      .populate('donor', 'name email organization')
      .sort({ createdAt: -1 });

    res.json({ data: listings });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/admin/users', async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { role } = req.query;

    const users = await User.find(role ? { role } : {})
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({ data: users });

  } catch (err) {
    res.status(500).json({ message: 'Error' });
  }
});



// 🔥 DELETE USER (ADMIN ONLY)
router.delete('/users/:id', protect, async (req, res) => {
  try {
    // optional: check admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not allowed' });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.deleteOne();

    res.json({ message: 'User deleted successfully' });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
