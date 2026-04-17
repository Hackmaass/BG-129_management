const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// All order routes should be protected
router.post('/checkout', orderController.checkout);
router.get('/', orderController.getOrderHistory);

module.exports = router;
