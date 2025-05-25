const express = require('express');
const router = express.Router();
const controller = require('../controllers/controller');
const calculator = require('../controllers/calculator');
const sayhello = require('../controllers/sayHello');
// Define API routes
router.get('/json', controller.getData);
router.get('/sayHello', sayhello.getData);
router.post('/add', calculator.add);
module.exports = router;