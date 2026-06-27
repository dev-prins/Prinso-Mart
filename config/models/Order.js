const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: { type: String },
    emoji: { type: String },
    price: { type: Number },
    quantity: { type: Number },
  }],
  deliveryAddress: {
    name: { type: String },
    phone: { type: String },
    address: { type: String },
    area: { type: String },
    city: { type: String },
    pincode: { type: String },
    note: { type: String },
  },
  deliverySlot: { type: String },
  paymentMethod: { type: String, default: 'cod' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  itemsTotal: { type: Number },
  discount: { type: Number, default: 0 },
  deliveryCharge: { type: Number, default: 0 },
  couponDiscount: { type: Number, default: 0 },
  totalAmount: { type: Number },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'packed', 'picked', 'delivered', 'cancelled'],
    default: 'pending'
  },
  deliveryPartner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cancelReason: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', orderSchema);
