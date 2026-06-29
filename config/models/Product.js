const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    nameEn: {
      type: String,
      required: true,
    },
    nameHi: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    originalPrice: {
      type: Number,
      default: 0,
    },
    unit: {
      type: String,
      default: "1 kg",
    },
    category: {
      type: String,
      default: "vegetables",
    },
    stock: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    emoji: {
      type: String,
      default: "🛒",
    },
    image: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);
