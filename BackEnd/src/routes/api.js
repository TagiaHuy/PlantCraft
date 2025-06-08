// Import controller và middleware
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

// Auth routes
router.post('/auth/register', UserController.register);
router.post('/auth/login', UserController.login);
router.post('/auth/logout', authenticateToken, UserController.logout);
router.get('/auth/verify-email', UserController.verifyEmail);
router.post('/auth/resend-verification', UserController.resendverifyEmail); // ✅ sửa route

// Password reset
router.post('/auth/request-reset', UserController.requestPasswordReset);
router.post('/auth/reset-password', UserController.resetPassword);

// User profile
router.get('/user/profile', authenticateToken, UserController.getProfile);
router.put('/user/profile', authenticateToken, UserController.updateProfile);

// Admin: list sessions
router.get('/admin/active-users', authenticateToken, UserController.listActiveSessions);

module.exports = router;
