const express = require('express');
const router = express.Router();
const { getMessage } = require('../controllers/messageController');

router.get('/json', getMessage);

module.exports = router;