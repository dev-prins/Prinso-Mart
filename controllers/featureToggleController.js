const FeatureToggle = require("../config/models/FeatureToggle");

// Get feature settings
const getFeatureToggle = async (req, res) => {
  try {
    let settings = await FeatureToggle.findOne();

    if (!settings) {
      settings = await FeatureToggle.create({
        home: true,
        categories: true,
        search: true,
        cart: true,
        wishlist: true,
        offers: true,
        delivery: true,
        wallet: false,
        referral: false,
      });
    }

    res.status(200).json(settings);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Update feature settings
const updateFeatureToggle = async (req, res) => {
  try {
    let settings = await FeatureToggle.findOne();

    if (!settings) {
      settings = await FeatureToggle.create(req.body);
    } else {
      Object.assign(settings, req.body);
      await settings.save();
    }

    res.status(200).json(settings);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

module.exports = {
  getFeatureToggle,
  updateFeatureToggle,
};
