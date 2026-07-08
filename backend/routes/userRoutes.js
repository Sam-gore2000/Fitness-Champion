const express = require('express');
const { protect } = require('../middleware/auth');
const { updateProfile, getProfile, updateTheme } = require('../controllers/userController');

const router = express.Router();

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.patch('/theme', protect, updateTheme);

module.exports = router;
