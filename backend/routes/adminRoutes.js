const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const {
  listUsers, updateUser, deleteUser,
  listFoods, createFood, updateFood, deleteFood,
  broadcastNotification, listAiPrompts, upsertAiPrompt, getStats,
} = require('../controllers/adminController');

const router = express.Router();
router.use(protect, adminOnly);

router.get('/stats', getStats);

router.get('/users', listUsers);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

router.get('/foods', listFoods);
router.post('/foods', createFood);
router.put('/foods/:id', updateFood);
router.delete('/foods/:id', deleteFood);

router.post('/notifications/broadcast', broadcastNotification);

router.get('/ai-prompts', listAiPrompts);
router.put('/ai-prompts', upsertAiPrompt);

module.exports = router;
