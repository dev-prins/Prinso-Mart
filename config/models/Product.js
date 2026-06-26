const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  image: { type: String }, // URL to product image
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  stock: { type: Number, default: 0 },
  isAvailable: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
