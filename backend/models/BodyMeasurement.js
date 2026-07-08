const mongoose = require('mongoose');

const bodyMeasurementSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, default: Date.now, index: true },
    weightKg: Number,
    chestCm: Number,
    waistCm: Number,
    armsCm: Number,
    legsCm: Number,
    neckCm: Number,
    bodyFatPct: Number,
    photoUrl: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('BodyMeasurement', bodyMeasurementSchema);
