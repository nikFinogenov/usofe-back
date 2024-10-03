const express = require('express');
const { createAnswer } = require('../controllers/answerController');
const router = express.Router();

// Create a new answer
router.post('/', createAnswer);

module.exports = router;
