const mongoose = require('mongoose');

const serviceAreaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  pincode: { type: String, required: true },
  city: { type: String, required: true },
  deliveryCharge: { type: Number, default: 0 },
  minOrderAmount: { type: Number, default: 199 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ServiceArea', serviceAreaSchema);
