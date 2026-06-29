const FeatureToggle = require("../models/FeatureToggle");

// Get settings
const getFeatureToggle = async (req, res) => {
  try {
    let settings = await FeatureToggle.findOne();

    if (!settings) {
      settings = await FeatureToggle.create({});
    }

    res.json(settings);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Update settings
const updateFeatureToggle = async (req, res) => {
  try {
    let settings = await FeatureToggle.findOne();

    if (!settings) {
      settings = await FeatureToggle.create(req.body);
    } else {
      Object.assign(settings, req.body);
      await settings.save();
    }

    res.json(settings);
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
