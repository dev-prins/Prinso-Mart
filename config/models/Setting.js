const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true }, // Can store various types of settings
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update `updatedAt` field on save
settingSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Setting = mongoose.model('Setting', settingSchema);
module.exports = Setting;
