const FeatureToggle = require("../FeatureToggle");

const getFeatureToggle = async (req, res) => {
  res.json({ success: true, message: "Feature Toggle Working" });
};

const updateFeatureToggle = async (req, res) => {
  res.json({ success: true, message: "Feature Toggle Updated" });
};

module.exports = {
  getFeatureToggle,
  updateFeatureToggle,
};
