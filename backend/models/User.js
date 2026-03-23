// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String, // optional –  password login
  },
  fullName: {
    type: String,
    trim: true,
  },
  mobile: {
    type: String,
    trim: true,
  },
  addresses: [{
    addressLine: String,
    city: String,
    landmark: String,
    pincode: String,
    state: String,
    country: { type: String, default: 'India' },
    isDefault: { type: Boolean, default: false }
  }],
  designHistory: [{
    name: String,
    canvasData: Object, // Fabric.js JSON
    previewUrl: String,
    createdAt: { type: Date, default: Date.now }
  }],
  loyaltyPoints: {
    type: Number,
    default: 0,
  },
  profileComplete: {
    type: Boolean,
    default: false,
  },
  otp: {
    code: String,
    expiresAt: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', userSchema);