const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const FoodListing = require('../models/FoodListing');
const DonationHistory = require('../models/DonationHistory');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { sendNotification } = require('../utils/notifications');
// ❌ Removed WhatsApp import

// Create request
router.post('/', protect, authorize('receiver', 'admin'), async (req, res) => {
  try {
    const { foodListingId, message, quantityRequested, quantityUnit, requesterPhone, pickupTime } = req.body;

    const listing = await FoodListing.findById(foodListingId);
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
    if (listing.status !== 'available') return res.status(400).json({ success: false, message: 'Food not available' });

    const existing = await Request.findOne({
      foodListing: foodListingId,
      requester: req.user._id,
      status: 'pending'
    });
    if (existing) return res.status(400).json({ success: false, message: 'You already requested this food' });

    const request = await Request.create({
      foodListing: foodListingId,
      requester: req.user._id,
      donor: listing.donor,
      message,
      quantityRequested: quantityRequested || listing.quantity,
      quantityUnit: quantityUnit || listing.quantityUnit,
      requesterPhone: requesterPhone || req.user.phone,
      pickupTime
    });

    await FoodListing.findByIdAndUpdate(foodListingId, { $inc: { requestCount: 1 } });

    const io = req.app.get('io');

    const phoneInfo = requesterPhone || req.user.phone;
    const qtyInfo = quantityRequested ? ` (${quantityRequested} ${quantityUnit || listing.quantityUnit})` : '';
    await sendNotification(
      listing.donor,
      `📦 ${req.user.name} requested "${listing.title}"${qtyInfo}${phoneInfo ? ` · 📞 ${phoneInfo}` : ''}`,
      'info', '/dashboard', io
    );

    io.to(`user-${listing.donor}`).emit('new-request', { request });
    res.status(201).json({ success: true, data: request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get my requests
router.get('/my', protect, async (req, res) => {
  try {
    const requests = await Request.find({ requester: req.user._id })
      .populate('foodListing', 'title images category location expiryTime quantity quantityUnit')
      .populate('donor', 'name avatar organization phone')
      .sort('-createdAt');
    res.json({ success: true, data: requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get incoming requests
router.get('/incoming', protect, authorize('donor', 'admin'), async (req, res) => {
  try {
    const requests = await Request.find({ donor: req.user._id })
      .populate('foodListing', 'title images category location quantity quantityUnit')
      .populate('requester', 'name avatar organization phone')
      .sort('-createdAt');
    res.json({ success: true, data: requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update request status
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status, cancelReason } = req.body;

    const request = await Request.findById(req.params.id)
      .populate('foodListing')
      .populate('requester', 'name phone organization')
      .populate('donor', 'name phone');

    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    if (request.donor._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

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
        `✅ Your request for "${listing.title}" (${request.quantityRequested} ${request.quantityUnit}) was APPROVED! Contact donor to arrange pickup.`,
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
        `❌ Your request for "${listing.title}" was not approved.`,
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
        `🎉 Donation of "${listing.title}" completed! Thank you.`,
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
    }

    await request.save();
    res.json({ success: true, data: request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;