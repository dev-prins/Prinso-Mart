const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  unit: { type: String, default: '1 kg' },
  category: { type: String, default: 'vegetables' },
  stock: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  emoji: { type: String, default: '🛒' },
  image: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
