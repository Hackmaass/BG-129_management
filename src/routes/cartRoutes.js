const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// All cart routes should be protected by auth middleware eventually
router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);
router.patch('/item/:productId', cartController.updateCartItem);
router.delete('/remove/:productId', cartController.removeFromCart);

module.exports = router;
