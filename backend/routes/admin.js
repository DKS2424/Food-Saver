const express = require('express');
const router = express.Router();
const User = require('../models/User');
const FoodListing = require('../models/FoodListing');
const Request = require('../models/Request');
const DonationHistory = require('../models/DonationHistory');
const { protect, authorize } = require('../middleware/auth');
const { sendNotification } = require('../utils/notifications');

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

// Get all requests (admin)
router.get('/requests', async (req, res) => {
  try {
    const requests = await Request.find()
      .populate('foodListing', 'title images category quantity quantityUnit')
      .populate('requester', 'name email phone organization')
      .populate('donor', 'name email phone')
      .sort('-createdAt')
      .limit(100);
    res.json({ success: true, data: requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update request status (admin override)
router.put('/requests/:id/status', async (req, res) => {
  try {
    const { status, cancelReason } = req.body;
    const request = await Request.findById(req.params.id)
      .populate('foodListing')
      .populate('requester', 'name phone organization')
      .populate('donor', 'name phone');

    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    request.status = status;
    if (cancelReason) request.cancelReason = cancelReason;

    const io = req.app.get('io');
    const listing = request.foodListing;

    if (status === 'approved') {
      const reqQty = parseFloat(request.quantityRequested);
      const listQty = parseFloat(listing.quantity);
      const isPartial = !isNaN(reqQty) && !isNaN(listQty) && reqQty > 0 && reqQty < listQty &&
        request.quantityUnit === listing.quantityUnit;

      if (isPartial) {
        const remaining = listQty - reqQty;
        const update = { quantity: String(remaining) };
        if (remaining <= 0) {
          update.status = 'claimed';
          update.claimedBy = request.requester._id;
        }
        await FoodListing.findByIdAndUpdate(listing._id, update);
      } else {
        await FoodListing.findByIdAndUpdate(listing._id, {
          status: 'claimed', claimedBy: request.requester._id
        });
      }

      await sendNotification(
        request.requester._id,
        `✅ Your request for "${listing.title}" (${request.quantityRequested} ${request.quantityUnit}) was APPROVED by admin!`,
        'success', '/dashboard', io
      );

    } else if (status === 'rejected') {
      const isPartiallyApproved = listing.status === 'available' && listing.claimedBy === null;
      if (!isPartiallyApproved) {
        await FoodListing.findByIdAndUpdate(listing._id, {
          status: 'available', claimedBy: null
        });
      }

      await sendNotification(
        request.requester._id,
        `❌ Your request for "${listing.title}" was rejected by admin.`,
        'warning', '/dashboard', io
      );

    } else if (status === 'completed') {
      request.completedAt = new Date();

      await FoodListing.findByIdAndUpdate(listing._id, {
        status: 'claimed', claimedBy: request.requester._id
      });

      await DonationHistory.create({
        donor: request.donor._id,
        receiver: request.requester._id,
        foodListing: listing._id,
        request: request._id,
        quantity: request.quantityRequested || listing.quantity,
        category: listing.category,
        impact: { mealsProvided: 4, co2Saved: 2.5, waterSaved: 1000 }
      });

      await User.findByIdAndUpdate(request.donor._id, { $inc: { donationCount: 1 } });
      await User.findByIdAndUpdate(request.requester._id, { $inc: { receivedCount: 1 } });

      await sendNotification(
        request.requester._id,
        `🎉 Donation of "${listing.title}" marked completed by admin!`,
        'success', '/dashboard', io
      );

    } else if (status === 'cancelled') {
      request.cancelledAt = new Date();

      const isPartial = listing.status !== 'pending' || listing.claimedBy === null;
      if (!isPartial) {
        await FoodListing.findByIdAndUpdate(listing._id, {
          status: 'available', claimedBy: null
        });
      }

      await sendNotification(
        request.requester._id,
        `❌ Your request for "${listing.title}" was cancelled by admin.`,
        'warning', '/dashboard', io
      );
    }

    await request.save();
    res.json({ success: true, data: request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
