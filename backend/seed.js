/**
 * FoodSaver Seed Script
 * Run: node seed.js
 * Seeds demo users and food listings for testing
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const FoodListing = require('./models/FoodListing');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/foodsaver';

const demoUsers = [
  { name: 'Admin User', email: 'admin@foodsaver.com', password: 'admin123', role: 'admin', phone: '+91 9000000001', isActive: true },
  { name: 'Ravi Kumar', email: 'donor@foodsaver.com', password: 'donor123', role: 'donor', phone: '+91 9000000002', organization: 'Hotel Saravana Bhavan', isActive: true },
  { name: 'Priya NGO', email: 'ngo@foodsaver.com', password: 'ngo12345', role: 'receiver', phone: '+91 9000000003', organization: 'Feed India Foundation', isActive: true },
];

const demoListings = [
  {
    title: 'Fresh Biryani – 20 Portions',
    description: 'Leftover from a wedding banquet. Freshly cooked chicken biryani, packed hygienically. Still warm.',
    category: 'cooked-meals', quantity: '20', quantityUnit: 'servings',
    expiryTime: new Date(Date.now() + 5 * 3600000),
    location: { address: '12 MG Road', city: 'Bangalore', state: 'Karnataka', pincode: '560001', coordinates: { lat: 12.9716, lng: 77.5946 } },
    isVegetarian: false, status: 'available',
    images: ['https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80'],
    tags: ['hot-food', 'ready-to-eat', 'wedding-surplus']
  },
  {
    title: 'Mixed Vegetable Box – 15kg',
    description: 'Fresh vegetables from our restaurant daily prep. Includes carrots, beans, tomatoes, onions. All washed and sorted.',
    category: 'raw-vegetables', quantity: '15', quantityUnit: 'kg',
    expiryTime: new Date(Date.now() + 24 * 3600000),
    location: { address: '45 Jayanagar 4th Block', city: 'Bangalore', state: 'Karnataka', pincode: '560041', coordinates: { lat: 12.9279, lng: 77.5933 } },
    isVegetarian: true, isVegan: true, status: 'available',
    images: ['https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80'],
    tags: ['fresh', 'organic']
  },
  {
    title: 'Bakery Bread & Pastries',
    description: 'End-of-day surplus from our bakery. Includes white loaves, whole wheat bread, and assorted pastries.',
    category: 'bakery', quantity: '25', quantityUnit: 'pieces',
    expiryTime: new Date(Date.now() + 8 * 3600000),
    location: { address: 'Commercial Street', city: 'Bangalore', state: 'Karnataka', pincode: '560001', coordinates: { lat: 12.9850, lng: 77.6072 } },
    isVegetarian: true, status: 'available',
    images: ['https://images.unsplash.com/photo-1549931319-a545dcf3bc7b?w=400&q=80'],
    tags: ['bakery', 'bread', 'pastry']
  },
  {
    title: 'Fruit Basket – Assorted',
    description: 'Slightly ripe but perfectly good fruits from our event. Mangoes, bananas, apples, and grapes.',
    category: 'fruits', quantity: '10', quantityUnit: 'kg',
    expiryTime: new Date(Date.now() + 12 * 3600000),
    location: { address: 'Koramangala 5th Block', city: 'Bangalore', state: 'Karnataka', pincode: '560095', coordinates: { lat: 12.9352, lng: 77.6245 } },
    isVegetarian: true, isVegan: true, status: 'available',
    images: ['https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&q=80'],
    tags: ['fruits', 'fresh', 'event-surplus']
  },
  {
    title: 'Dal & Rice Meals – 30 Packets',
    description: 'Packed dal-rice meals from our canteen. Each packet contains rice, dal tadka, and a papad. Sealed.',
    category: 'cooked-meals', quantity: '30', quantityUnit: 'servings',
    expiryTime: new Date(Date.now() + 4 * 3600000),
    location: { address: 'Electronic City Phase 1', city: 'Bangalore', state: 'Karnataka', pincode: '560100', coordinates: { lat: 12.8392, lng: 77.6772 } },
    isVegetarian: true, status: 'available',
    images: ['https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=400&q=80'],
    tags: ['packed', 'dal-rice', 'canteen']
  },
  {
    title: 'Milk & Dairy Products',
    description: 'Surplus milk (3 liters), paneer (500g), and yogurt (1kg) from our café. Refrigerated and fresh.',
    category: 'dairy', quantity: '4.5', quantityUnit: 'kg',
    expiryTime: new Date(Date.now() + 6 * 3600000),
    location: { address: 'Indiranagar 100ft Road', city: 'Bangalore', state: 'Karnataka', pincode: '560038', coordinates: { lat: 12.9719, lng: 77.6412 } },
    isVegetarian: true, status: 'available',
    images: ['https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&q=80'],
    tags: ['dairy', 'milk', 'paneer', 'refrigerated']
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await FoodListing.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Create users
    const createdUsers = await User.create(demoUsers);
    console.log(`👥 Created ${createdUsers.length} users`);

    const donor = createdUsers.find(u => u.role === 'donor');

    // Create listings with donor reference
    const listingsWithDonor = demoListings.map(l => ({ ...l, donor: donor._id }));
    const createdListings = await FoodListing.create(listingsWithDonor);
    console.log(`🍱 Created ${createdListings.length} food listings`);

    console.log('\n🎉 Seed complete! Demo accounts:');
    console.log('  Admin:    admin@foodsaver.com / admin123');
    console.log('  Donor:    donor@foodsaver.com / donor123');
    console.log('  Receiver: ngo@foodsaver.com   / ngo12345');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
