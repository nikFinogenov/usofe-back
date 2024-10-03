const express = require('express');
const { createQuestion, getQuestions } = require('../controllers/questionController');
const router = express.Router();

// Create a new question
router.post('/', createQuestion);

// Get all questions
router.get('/', getQuestions);

module.exports = router;
