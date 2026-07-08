const express = require('express');
const { protect } = require('../middleware/auth');
const { getTodayMissions, updateMissionProgress, getBadges } = require('../controllers/missionController');

const router = express.Router();

router.get('/today', protect, getTodayMissions);
router.patch('/:id/progress', protect, updateMissionProgress);
router.get('/badges', protect, getBadges);

module.exports = router;
