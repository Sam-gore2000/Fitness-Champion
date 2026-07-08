const express = require('express');
const { protect } = require('../middleware/auth');
const { generateBudgetPlan } = require('../controllers/budgetController');

const router = express.Router();

router.post('/plan', protect, generateBudgetPlan);

module.exports = router;
