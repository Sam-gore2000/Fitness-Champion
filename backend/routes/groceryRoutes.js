const express = require('express');
const { protect } = require('../middleware/auth');
const { generateGroceryList, getGroceryLists, toggleItem } = require('../controllers/groceryController');

const router = express.Router();

router.post('/generate', protect, generateGroceryList);
router.get('/', protect, getGroceryLists);
router.patch('/:listId/items/:itemIndex', protect, toggleItem);

module.exports = router;
