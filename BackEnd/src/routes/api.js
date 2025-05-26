const express = require('express');
const router = express.Router();
const controller = require('../controllers/controller');
const calculator = require('../controllers/calculator');
const sayhello = require('../controllers/sayHello');
const plantController = require('../controllers/plantController');

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

module.exports = router;