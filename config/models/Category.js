const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({

  name: {
    type: String,
    required: true,
    trim: true
  },

  slug: {
    type: String,
    unique: true
  },

  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    default: null
  },

  icon: {
    type: String,
    default: ""
  },

  image: {
    type: String,
    default: ""
  },

  banner: {
    type: String,
    default: ""
  },

  color: {
    type: String,
    default: "#FFD400"
  },

  description: {
    type: String,
    default: ""
  },

  sortOrder: {
    type: Number,
    default: 0
  },

  homePage: {
    type: Boolean,
    default: true
  },

  featured: {
    type: Boolean,
    default: false
  },

  isActive: {
    type: Boolean,
    default: true
  },

  isDeleted: {
    type: Boolean,
    default: false
  },

  seoTitle: {
    type: String,
    default: ""
  },

  seoDescription: {
    type: String,
    default: ""
  }

}, {
  timestamps: true
});

module.exports = mongoose.model("Category", categorySchema);
