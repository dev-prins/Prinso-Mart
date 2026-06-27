const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  oldPrice: { type: Number },
  discount: { type: Number, default: 0 },
  unit: { type: String, default: '1 kg' },
  emoji: { type: String, default: '🥦' },
  image: { type: String },
  category: { 
    type: String, 
    enum: ['vegetables', 'fruits', 'dairy', 'grains', 'snacks', 'other'],
    default: 'vegetables'
  },
  stock: { type: Number, default: 0 },
  isAvailable: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  ratings: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Product', productSchema);
