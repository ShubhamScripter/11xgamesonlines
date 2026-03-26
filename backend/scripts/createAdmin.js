// File: scripts/createAdmin.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/user.model');

dotenv.config();

const createAdmin = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const existingAdmin = await User.findOne({ role: 'admin' });
  if (existingAdmin) {
    console.log('Admin already exists.');
    return process.exit();
  }

  const newAdmin = new User({
    username: 'adminbaaji',
    email: 'admin@baaji.live',
    password: 'admin123', // Will be hashed
    role: 'admin',
    timezone: 'Asia/Kolkata',
    siteTag: 'baaji',
    status: 'active',
    totalBalance: 0,
    totalExposure: 0,
    totalAvailableBalance: 0,
    balance: 0,
    availableBalance: 0,
    totalPlayerBalance: 0,
    isCheatBet: false,
  });

  await newAdmin.save();
  console.log('Admin user created successfully!');
  process.exit();
};

createAdmin().catch(err => {
  console.error('Error creating admin:', err);
  process.exit(1);
});
