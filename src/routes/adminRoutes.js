const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const orderController = require('../controllers/orderController');
const authController = require('../controllers/authController');
const { verifyToken, requireAdmin } = require('../middlewares/authMiddleware');

// All routes here require Admin role
router.use(verifyToken, requireAdmin);

// Product Management
router.post('/products', productController.createProduct || ((req, res) => res.status(501).json({message: "Not implemented"})));
router.patch('/products/:id', productController.updateProduct || ((req, res) => res.status(501).json({message: "Not implemented"})));
router.delete('/products/:id', productController.deleteProduct || ((req, res) => res.status(501).json({message: "Not implemented"})));

// Order Overview
router.get('/orders', orderController.getAllOrders || ((req, res) => res.status(501).json({message: "Not implemented"})));
router.patch('/orders/:id/status', orderController.updateOrderStatus || ((req, res) => res.status(501).json({message: "Not implemented"})));

// User Management
router.get('/users', authController.getAllUsers || ((req, res) => res.status(501).json({message: "Not implemented"})));

module.exports = router;
