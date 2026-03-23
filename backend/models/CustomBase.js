// models/CustomBase.js
const mongoose = require('mongoose');

const customBaseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  basePrice: {
    type: Number,
    required: true,
    min: 0,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
  },
  stock: {
    type: Number,
    default: 50,
    min: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('CustomBase', customBaseSchema);