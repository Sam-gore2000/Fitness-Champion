const express = require('express');
const { protect } = require('../middleware/auth');
const { getCalendar } = require('../controllers/calendarController');

const router = express.Router();

router.get('/', protect, getCalendar);

module.exports = router;
