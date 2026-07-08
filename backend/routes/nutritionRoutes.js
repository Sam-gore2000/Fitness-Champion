const express = require('express');
const { protect } = require('../middleware/auth');
const {
  searchFoods, logMeal, getMeals, deleteMeal,
  logWater, logSteps, logSleep, getDailyLog,
} = require('../controllers/nutritionController');

const router = express.Router();

router.get('/foods/search', protect, searchFoods);
router.post('/meals', protect, logMeal);
router.get('/meals', protect, getMeals);
router.delete('/meals/:id', protect, deleteMeal);
router.post('/water', protect, logWater);
router.post('/steps', protect, logSteps);
router.post('/sleep', protect, logSleep);
router.get('/daily-log', protect, getDailyLog);

module.exports = router;
