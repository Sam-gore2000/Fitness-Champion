const express = require('express');
const { protect } = require('../middleware/auth');
const {
  chatWithCoach, getChatHistory, getMealRecommendations,
  recognizeMeal, estimateNutrition, getWeeklyReport, getMonthlyReport,
} = require('../controllers/aiController');

const router = express.Router();

router.post('/chat', protect, chatWithCoach);
router.get('/chat/history', protect, getChatHistory);
router.get('/recommendations', protect, getMealRecommendations);
router.post('/meal-recognition', protect, recognizeMeal);
router.post('/estimate-nutrition', protect, estimateNutrition);
router.get('/reports/weekly', protect, getWeeklyReport);
router.get('/reports/monthly', protect, getMonthlyReport);

module.exports = router;
