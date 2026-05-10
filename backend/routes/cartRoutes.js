
const express = require('express');
const router = express.Router();
const { getCart, addToCart, removeFromCart, removeItemCompletely, clearCart } = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); 
router.get('/', getCart);
router.post('/add', addToCart);
router.post('/remove', removeFromCart);
router.delete('/clear', clearCart);
router.delete('/:foodId', removeItemCompletely);

module.exports = router;
