const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const FoodListing = require('../models/FoodListing');
const DonationHistory = require('../models/DonationHistory');
const { protect, authorize } = require('../middleware/auth');
const { sendNotification } = require('../utils/notifications');

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `food-${Date.now()}-${Math.round(Math.random()*1E9)}${path.extname(file.originalname)}`)
});
const upload = multer({ storage, limits: { fileSize: 5*1024*1024 }, fileFilter: (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  cb(null, allowed.test(path.extname(file.originalname).toLowerCase()));
}});

// Get all food listings (public, with filters)
router.get('/', async (req, res) => {
  try {
    const { category, city, status = 'available', page = 1, limit = 12, search, sort = '-createdAt' } = req.query;
    const query = {};
    if (status) query.status = status;
    if (category && category !== 'all') query.category = category;
    if (city) query['location.city'] = new RegExp(city, 'i');
    if (search) query.$or = [
      { title: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') },
      { tags: new RegExp(search, 'i') }
    ];
    const total = await FoodListing.countDocuments(query);
    const listings = await FoodListing.find(query)
      .populate('donor', 'name avatar organization rating')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    res.json({ success: true, data: listings, pagination: { total, page: parseInt(page), pages: Math.ceil(total/limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get single listing
router.get('/:id', async (req, res) => {
  try {
    const listing = await FoodListing.findByIdAndUpdate(
      req.params.id, { $inc: { views: 1 } }, { new: true }
    ).populate('donor', 'name avatar organization phone rating address');
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
    res.json({ success: true, data: listing });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create listing (donor only)
// Create listing (donor only)
router.post('/', protect, authorize('donor', 'admin'), upload.array('images', 5), async (req, res) => {
  try {
    const images = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];

    const listingData = {
      ...req.body,
      images,
      donor: req.user._id,

      status: 'available', // 🔥 THIS IS THE FIX

      isVegetarian: req.body.isVegetarian === 'true' || req.body.isVegetarian === true,
      isVegan: req.body.isVegan === 'true' || req.body.isVegan === true,
      allergens: Array.isArray(req.body.allergens)
        ? req.body.allergens
        : (req.body.allergens
            ? req.body.allergens.split(',').map(s => s.trim()).filter(Boolean)
            : []),
      tags: Array.isArray(req.body.tags)
        ? req.body.tags
        : (req.body.tags
            ? req.body.tags.split(',').map(s => s.trim()).filter(Boolean)
            : []),
      location: {
        address: req.body.address || req.body['location[address]'] || '',
        city: req.body.city || req.body['location[city]'] || '',
        state: req.body.state || req.body['location[state]'] || '',
        pincode: req.body.pincode || req.body['location[pincode]'] || '',
        coordinates: { lat: 12.9716, lng: 77.5946 }
      }
    };

    const listing = await FoodListing.create(listingData);

    const io = req.app.get('io');
    io.emit('new-listing', { listing: await listing.populate('donor', 'name avatar') });

    res.status(201).json({ success: true, data: listing });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update listing
router.put('/:id', protect, async (req, res) => {
  try {
    const listing = await FoodListing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: 'Not found' });
    if (listing.donor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const updated = await FoodListing.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete listing
router.delete('/:id', protect, async (req, res) => {
  try {
    const listing = await FoodListing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: 'Not found' });
    if (listing.donor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await listing.deleteOne();
    res.json({ success: true, message: 'Listing deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get stats
router.get('/stats/summary', async (req, res) => {
  try {
    const [total, available, claimed, expired] = await Promise.all([
      FoodListing.countDocuments(),
      FoodListing.countDocuments({ status: 'available' }),
      FoodListing.countDocuments({ status: 'claimed' }),
      FoodListing.countDocuments({ status: 'expired' })
    ]);
    const donations = await DonationHistory.countDocuments();
    res.json({ success: true, data: { total, available, claimed, expired, donations, mealsProvided: donations * 4 } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 🔥 NGO / Receiver Feed (VERY IMPORTANT)
router.get('/volunteer/feed', async (req, res) => {
  try {
    const listings = await FoodListing.find({ status: 'available' })
      .sort({ createdAt: -1 });

    res.json({ data: listings });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
