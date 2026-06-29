const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true,
    trim: true
  },

  slug: {
    type: String,
    unique: true
  },

  brand: {
    type: String,
    default: ""
  },

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true
  },

  subCategory: {
    type: String,
    default: ""
  },

  description: {
    type: String,
    default: ""
  },

  images: [
    {
      url: String,
      public_id: String
    }
  ],

  mrp: {
    type: Number,
    required: true
  },

  sellingPrice: {
    type: Number,
    required: true
  },

  costPrice: {
    type: Number,
    default: 0
  },

  discount: {
    type: Number,
    default: 0
  },

  gst: {
    type: Number,
    default: 0
  },

  stock: {
    type: Number,
    default: 0
  },

  minOrderQty: {
    type: Number,
    default: 1
  },

  maxOrderQty: {
    type: Number,
    default: 20
  },

  unit: {
    type: String,
    enum: [
      "piece",
      "kg",
      "gm",
      "litre",
      "ml",
      "packet",
      "box",
      "dozen"
    ],
    default: "piece"
  },

  weight: {
    type: Number,
    default: 0
  },

  barcode: {
    type: String,
    default: ""
  },

  sku: {
    type: String,
    default: ""
  },

  tags: [String],

  rating: {
    type: Number,
    default: 0
  },

  totalReviews: {
    type: Number,
    default: 0
  },

  featured: {
    type: Boolean,
    default: false
  },

  trending: {
    type: Boolean,
    default: false
  },

  flashSale: {
    type: Boolean,
    default: false
  },

  comboOffer: {
    type: Boolean,
    default: false
  },

  organic: {
    type: Boolean,
    default: false
  },

  seasonal: {
    type: Boolean,
    default: false
  },

  veg: {
    type: Boolean,
    default: true
  },

  returnAvailable: {
    type: Boolean,
    default: false
  },

  replaceAvailable: {
    type: Boolean,
    default: false
  },

  estimatedDelivery: {
    type: Number,
    default: 15
  },

  isActive: {
    type: Boolean,
    default: true
  },

  isDeleted: {
    type: Boolean,
    default: false
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }

}, {
  timestamps: true
});

module.exports = mongoose.model("Product", productSchema);
