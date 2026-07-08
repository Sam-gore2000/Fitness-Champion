const asyncHandler = require('express-async-handler');
const BodyMeasurement = require('../models/BodyMeasurement');

// @desc Log a body measurement entry
// @route POST /api/body
const createMeasurement = asyncHandler(async (req, res) => {
  const { date, weightKg, chestCm, waistCm, armsCm, legsCm, neckCm, bodyFatPct, photoUrl } = req.body;
  const entry = await BodyMeasurement.create({
    user: req.user._id,
    date: date || Date.now(),
    weightKg, chestCm, waistCm, armsCm, legsCm, neckCm, bodyFatPct, photoUrl,
  });

  if (weightKg) {
    req.user.weightKg = weightKg;
    await req.user.save();
  }

  res.status(201).json({ success: true, measurement: entry });
});

// @desc Get measurement history (for weekly/monthly charts)
// @route GET /api/body?range=weekly|monthly
const getMeasurements = asyncHandler(async (req, res) => {
  const { range = 'monthly' } = req.query;
  const days = range === 'weekly' ? 7 : 30;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const measurements = await BodyMeasurement.find({
    user: req.user._id,
    date: { $gte: since },
  }).sort({ date: 1 });

  res.json({ success: true, measurements });
});

module.exports = { createMeasurement, getMeasurements };
