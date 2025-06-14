// Import controller và middleware
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const taskController = require('../controllers/taskController');
const GoalController = require('../controllers/goalController');
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

// Goal routes rizzS
router.post('/goals', authenticateToken, GoalController.createGoal);
router.get('/goals', authenticateToken, GoalController.getGoals);
router.get('/goals/:goalId', authenticateToken, GoalController.getGoalById);
router.put('/goals/:goalId', authenticateToken, GoalController.updateGoal);
router.put('/goals/:goalId/progress', authenticateToken, GoalController.updateProgress);
router.delete('/goals/:goalId', authenticateToken, GoalController.deleteGoal);
router.get('/goals/completed', authenticateToken, GoalController.getCompletedGoals);
router.post('/goals/groups', authenticateToken, GoalController.createGoalGroup);
router.get('/goals/stats', authenticateToken, GoalController.getGoalStats);

// API for goals (this group is redundant and should be removed)
// These routes are already included above for better structure, so we will remove this section.

module.exports = router;
