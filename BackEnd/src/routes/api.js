const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

const { authenticateToken, requireEmailVerified } = require('../middleware/auth');

router.post('/auth/register', userController.register);
router.post('/auth/login', userController.login);
router.get('/auth/verify-email', userController.verifyEmail);

// Password reset routes
router.post('/auth/request-reset', userController.requestPasswordReset);
router.post('/auth/reset-password', userController.resetPassword);

// Protected user routes
router.get('/user/profile', authenticateToken, userController.getProfile);
router.put('/user/profile', authenticateToken, userController.updateProfile);

module.exports = router;