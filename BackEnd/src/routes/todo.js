const express = require('express');
const router = express.Router();
const { getTodolist } = require('../controllers/todoController');

router.get('/todolist', getTodolist);

module.exports = router;