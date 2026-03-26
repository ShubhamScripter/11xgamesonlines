const mongoose = require('mongoose');

const loginLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['Login Success', 'Login Failed'],
    default: 'Login Success',
  },
  ip: String,
  userAgent: String,
  location: {
    city: String,
    state: String,
    country: String,
    isp: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('LoginLog', loginLogSchema);
