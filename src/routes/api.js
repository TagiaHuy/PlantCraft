// Import controller và middleware
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const taskController = require('../controllers/taskController');
const goalController = require('../controllers/goalController');
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

// Goal routes
router.post('/goals', authenticateToken, goalController.createGoal);
router.get('/goals', authenticateToken, goalController.getGoals);
router.get('/goals/completed', authenticateToken, goalController.getCompletedGoals);
router.get('/goals/stats', authenticateToken, goalController.getGoalStats);
router.post('/goals/groups', authenticateToken, goalController.createGoalGroup);
router.get('/goals/:goalId', authenticateToken, goalController.getGoalById);
router.put('/goals/:goalId', authenticateToken, goalController.updateGoal);
router.put('/goals/:goalId/progress', authenticateToken, goalController.updateProgress);
router.put('/goals/:goalId/result', authenticateToken, goalController.updateGoalResult);
router.delete('/goals/:goalId', authenticateToken, goalController.deleteGoal);

module.exports = router;
