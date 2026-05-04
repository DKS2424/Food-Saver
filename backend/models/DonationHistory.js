const mongoose = require('mongoose');

const donationHistorySchema = new mongoose.Schema({
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  foodListing: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodListing', required: true },
  request: { type: mongoose.Schema.Types.ObjectId, ref: 'Request' },
  quantity: String,
  category: String,
  completedAt: { type: Date, default: Date.now },
  impact: {
    mealsProvided: { type: Number, default: 0 },
    co2Saved: { type: Number, default: 0 },
    waterSaved: { type: Number, default: 0 }
  }
}, { timestamps: true });

module.exports = mongoose.model('DonationHistory', donationHistorySchema);
