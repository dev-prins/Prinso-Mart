const mongoose = require('mongoose');

const serviceAreaSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  zipCodes: [{ type: String, required: true }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const ServiceArea = mongoose.model('ServiceArea', serviceAreaSchema);
module.exports = ServiceArea;
