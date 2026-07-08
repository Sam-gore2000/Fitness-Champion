const express = require('express');
const { protect } = require('../middleware/auth');
const { createWorkout, getWorkouts, deleteWorkout, getPersonalRecords } = require('../controllers/workoutController');

const router = express.Router();

router.post('/', protect, createWorkout);
router.get('/', protect, getWorkouts);
router.delete('/:id', protect, deleteWorkout);
router.get('/records', protect, getPersonalRecords);

module.exports = router;
