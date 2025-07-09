// Import controller và middleware
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const taskController = require('../controllers/taskController');
const goalController = require('../controllers/goalController');
const goalPhaseController = require('../controllers/goalPhaseController');
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

// Progress tracking với phases
router.get('/goals/:goalId/progress-with-phases', authenticateToken, goalController.getProgressWithPhases);
router.get('/goals/:goalId/roadmap', authenticateToken, goalController.getGoalRoadmap);

// Goal Phase routes
router.post('/goals/:goalId/phases', authenticateToken, goalPhaseController.createPhase);
router.get('/goals/:goalId/phases', authenticateToken, goalPhaseController.getPhases);
router.get('/goals/:goalId/phases/:phaseId', authenticateToken, goalPhaseController.getPhaseById);
router.delete('/goals/:goalId/phases/:phaseId', authenticateToken, goalPhaseController.deletePhase);
router.put('/goals/:goalId/phases/reorder', authenticateToken, goalPhaseController.reorderPhases);
router.put('/goals/:goalId/phases/:phaseId', authenticateToken, goalPhaseController.updatePhase);
router.get('/goals/:goalId/phases/:phaseId/stats', authenticateToken, goalPhaseController.getPhaseStats);
router.put('/goals/:goalId/phases/:phaseId/auto-progress', authenticateToken, goalPhaseController.updatePhaseProgress);

// Task routes trong phases
router.post('/goals/:goalId/phases/:phaseId/tasks', authenticateToken, goalPhaseController.createTaskInPhase);
router.get('/goals/:goalId/phases/:phaseId/tasks', authenticateToken, goalPhaseController.getTasksInPhase);
router.put('/goals/:goalId/phases/:phaseId/tasks/:taskId/status', authenticateToken, goalPhaseController.updateTaskStatus);
router.put('/goals/:goalId/phases/:phaseId/tasks/:taskId/move', authenticateToken, goalPhaseController.moveTask);
router.get('/goals/:goalId/phases/:phaseId/tasks/stats', authenticateToken, goalPhaseController.getTaskStats);

// Task routes (tổng hợp)
router.post('/tasks', authenticateToken, taskController.createTask);
router.get('/tasks/today', authenticateToken, taskController.getTodayTasks);
router.put('/tasks/:id/status', authenticateToken, taskController.updateTaskStatus);
router.get('/tasks/statistics', authenticateToken, taskController.getTaskStatistics);
router.get('/tasks', authenticateToken, taskController.getAllTasks);

module.exports = router;
