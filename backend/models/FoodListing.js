const mongoose = require('mongoose');

const foodListingSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['cooked-meals', 'raw-vegetables', 'fruits', 'dairy', 'bakery', 'packaged', 'beverages', 'other'],
    required: true
  },
  quantity: { type: String, required: true },
  quantityUnit: { type: String, enum: ['kg', 'liter', 'pieces', 'servings', 'packets'], default: 'kg' },
  images: [{ type: String }],
  expiryTime: { type: Date, required: true },
  status: {
    type: String,
    enum: ['available', 'pending', 'claimed', 'expired', 'cancelled'],
    default: 'available'
  },
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  location: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: String,
    pincode: String,
    coordinates: {
      lat: { type: Number, default: 12.9716 },
      lng: { type: Number, default: 77.5946 }
    }
  },
  pickupInstructions: { type: String },
  allergens: [String],
  isVegetarian: { type: Boolean, default: true },
  isVegan: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  requestCount: { type: Number, default: 0 },
  tags: [String]
}, { timestamps: true });

foodListingSchema.index({ status: 1, expiryTime: 1 });
foodListingSchema.index({ 'location.city': 1 });
foodListingSchema.index({ donor: 1 });

module.exports = mongoose.model('FoodListing', foodListingSchema);
