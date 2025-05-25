const express = require('express');
const router = express.Router();
const controller = require('../controller');

// Define API routes
router.get('/json', controller.getData);

module.exports = router;