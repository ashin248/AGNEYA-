// models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  originalPrice: {
    type: Number,
    min: 0,
  },
  discount: {
    type: Number,
    min: 0,
    max: 100,
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

module.exports = mongoose.model('Product', productSchema);
// // models/Product.js
// const mongoose = require('mongoose');

// const productSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//     trim: true,
//   },
//   type: {
//     type: String,
//     enum: ['ready', 'custom-base'],
//     required: true,
//   },
//   // Ready product-ന് price required, custom-base-ന് വേണ്ട
//   price: {
//     type: Number,
//     min: 0,
//     required: function () {
//       return this.type === 'ready'; // ← conditional required
//     },
//   },
//   // Custom base-ന് basePrice required, ready-ന് വേണ്ട
//   basePrice: {
//     type: Number,
//     min: 0,
//     required: function () {
//       return this.type === 'custom-base'; // ← conditional required
//     },
//   },
//   // Optional fields for ready products
//   originalPrice: {
//     type: Number,
//     min: 0,
//   },
//   discount: {
//     type: Number,
//     min: 0,
//     max: 100,
//   },
//   category: {
//     type: String,
//     trim: true,
//   },
//   description: {
//     type: String,
//   },
//   stock: {
//     type: Number,
//     default: 50,
//     min: 0,
//   },
//   imageUrl: {
//     type: String,
//     required: true,
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// module.exports = mongoose.model('Product', productSchema);


