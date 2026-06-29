const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
{
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },

  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },

  group: {
    type: String,
    default: "general"
  },

  type: {
    type: String,
    default: "string"
  },

  description: {
    type: String,
    default: ""
  },

  isPublic: {
    type: Boolean,
    default: false
  },

  editable: {
    type: Boolean,
    default: true
  }

},
{
  timestamps: true
});

module.exports = mongoose.model("Setting", settingSchema);
