// Import controller và middleware
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const taskController = require('../controllers/taskController');

// Import middleware
const { authenticateToken } = require('../middleware/auth');

// Auth routes
router.post('/auth/register', userController.register);
router.post('/auth/login', userController.login);
router.post('/auth/logout', authenticateToken, userController.logout);
router.get('/auth/verify-email', userController.verifyEmail);
router.post('/auth/resend-verification', userController.resendverifyEmail);

// Password reset
router.post('/auth/request-reset', userController.requestPasswordReset);
router.post('/auth/reset-password', userController.resetPassword);

// User profile
router.get('/user/profile', authenticateToken, userController.getProfile);
router.put('/user/profile', authenticateToken, userController.updateProfile);

// new task
router.post('/tasks', taskController.createTask);
// router.get('/tasks', taskController.getTasks);
// router.get('/tasks/:id', taskController.getTaskById);
// router.put('/tasks/:id', taskController.updateTask);
// router.delete('/tasks/:id', taskController.deleteTask);
// router.get('/tasks', taskController.getTasks);

module.exports = router;
