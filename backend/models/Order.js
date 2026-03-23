const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      name: String,
      price: Number,
      quantity: { type: Number, default: 1 },
      customDesignUrl: String,
      customDesignJson: Object,
    }
  ],
  amount: { type: Number, required: true },
  address: {
    fullName: String,
    mobile: String,
    addressLine: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' },
  },
  status: {
    type: String,
    enum: ['Pending', 'Printing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending',
  },
  orderStatus: {
    type: String,
    enum: ['Pending', 'Printing', 'Shipped', 'Delivered'],
    default: 'Pending',
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Pending',
  },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  paymentMethod: { type: String, default: 'UPI Manual' },
  paymentConfirmedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
});

orderSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('Order', orderSchema);