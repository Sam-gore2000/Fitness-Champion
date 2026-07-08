const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: String,
    icon: String,
    xpThreshold: Number,
    criteria: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Badge', badgeSchema);
