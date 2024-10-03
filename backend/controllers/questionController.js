const db = require('../models');

// Create a question
exports.createQuestion = async (req, res) => {
  try {
    const { title, content, userId } = req.body;

    const newQuestion = await db.Question.create({
      title,
      content,
      userId,
    });

    res.status(201).json(newQuestion);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create question' });
  }
};

// Get all questions
exports.getQuestions = async (req, res) => {
  try {
    const questions = await db.Question.findAll();
    res.status(200).json(questions);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch questions' });
  }
};
