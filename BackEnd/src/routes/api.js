const express = require('express');
const router = express.Router();
const controller = require('../controllers/controller');
const calculator = require('../controllers/calculator');
const sayhello = require('../controllers/sayHello');
const plantController = require('../controllers/plantController');
const userController = require('../controllers/userController');
const { authenticateToken, requireEmailVerified } = require('../middleware/auth');

// Define API routes
router.get('/json', controller.getData);
router.get('/sayHello', sayhello.getData);
router.post('/add', calculator.add);

// Plant routes
router.get('/plants', plantController.getAllPlants);
router.get('/plants/:id', plantController.getPlantById);
router.post('/plants', plantController.createPlant);
router.put('/plants/:id', plantController.updatePlant);
router.delete('/plants/:id', plantController.deletePlant);

// User authentication routes
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