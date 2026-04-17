const express = require('express');
const router = express.Router();
const automationController = require('../controllers/automationController');
const { verifyToken } = require('../middlewares/authMiddleware');

// All automation/notification routes require authentication
router.use(verifyToken);

// Automation Rules CRUD
router.post('/', automationController.createAutomation);
router.get('/', automationController.getUserAutomations);
router.delete('/:id', automationController.deleteAutomation);

// AI Bonus
router.post('/generate', automationController.generateAIAutomation);

// Notifications
router.get('/notifications', automationController.getNotifications);
router.patch('/notifications/:id/read', automationController.markAsRead);

module.exports = router;
