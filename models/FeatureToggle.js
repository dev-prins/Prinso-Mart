const mongoose = require("mongoose");

const featureToggleSchema = new mongoose.Schema({

  // Home
  bannerSlider: { type: Boolean, default: true },
  categorySection: { type: Boolean, default: true },
  dealOfDay: { type: Boolean, default: true },
  flashSale: { type: Boolean, default: true },
  comboOffer: { type: Boolean, default: true },
  festivalOffer: { type: Boolean, default: true },

  // Products
  ratings: { type: Boolean, default: true },
  reviews: { type: Boolean, default: true },
  wishlist: { type: Boolean, default: true },
  recentlyViewed: { type: Boolean, default: true },
  productZoom: { type: Boolean, default: true },

  // Payments
  cod: { type: Boolean, default: true },
  upi: { type: Boolean, default: true },
  wallet: { type: Boolean, default: false },

  // Delivery
  scheduleDelivery: { type: Boolean, default: false },
  liveTracking: { type: Boolean, default: false },
  otpDelivery: { type: Boolean, default: false },

  // Support
  whatsappSupport: { type: Boolean, default: true },
  callSupport: { type: Boolean, default: true },
  chatSupport: { type: Boolean, default: false },
  ticketSupport: { type: Boolean, default: false },

  // Advanced
  referral: { type: Boolean, default: false },
  membership: { type: Boolean, default: false },
  aiRecommendation: { type: Boolean, default: false },
  voiceSearch: { type: Boolean, default: false },
  imageSearch: { type: Boolean, default: false },

  // Store
  maintenanceMode: { type: Boolean, default: false },
  storeOpen: { type: Boolean, default: true }

}, { timestamps: true });

module.exports = mongoose.model("FeatureToggle", featureToggleSchema);
