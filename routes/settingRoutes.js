const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  bannerSlider:     { type: Boolean, default: true },
  dealOfDay:        { type: Boolean, default: true },
  nearbyProducts:   { type: Boolean, default: true },
  categorySection:  { type: Boolean, default: true },
  recentlyViewed:   { type: Boolean, default: false },
  ratingsReviews:   { type: Boolean, default: true },
  productZoom:      { type: Boolean, default: false },
  outOfStockShow:   { type: Boolean, default: true },
  similarProducts:  { type: Boolean, default: true },
  nutritionInfo:    { type: Boolean, default: false },
  autoCoupon:       { type: Boolean, default: false },
  smartSuggestion:  { type: Boolean, default: false },
  scheduleDelivery: { type: Boolean, default: false },
  liveTracking:     { type: Boolean, default: false },
  otpDelivery:      { type: Boolean, default: false },
  deliveryContact:  { type: Boolean, default: true },
  upiPayment:       { type: Boolean, default: true },
  codPayment:       { type: Boolean, default: true },
  walletSystem:     { type: Boolean, default: false },
  refundSystem:     { type: Boolean, default: false },
  pushNotification: { type: Boolean, default: false },
  offerMessages:    { type: Boolean, default: true },
  orderAlerts:      { type: Boolean, default: true },
  maintenanceMode:  { type: Boolean, default: false },
  deliveryEnabled:  { type: Boolean, default: true },
  paymentsEnabled:  { type: Boolean, default: true },
}, { timestamps: true });

const Setting = mongoose.models.Setting || mongoose.model('Setting', settingSchema);

async function getOrCreate() {
  let setting = await Setting.findOne();
  if (!setting) setting = await Setting.create({});
  return setting;
}

router.get('/', async (req, res) => {
  try {
    const settings = await getOrCreate();
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/', async (req, res) => {
  try {
    const settings = await Setting.findOneAndUpdate(
      {},
      { $set: req.body },
      { new: true, upsert: true, runValidators: true }
    );
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
