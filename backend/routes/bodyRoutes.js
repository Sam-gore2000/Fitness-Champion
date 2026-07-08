const express = require('express');
const { protect } = require('../middleware/auth');
const { createMeasurement, getMeasurements } = require('../controllers/bodyController');

const router = express.Router();

router.post('/', protect, createMeasurement);
router.get('/', protect, getMeasurements);

module.exports = router;
