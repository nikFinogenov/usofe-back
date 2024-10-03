const db = require('../models');

// Create an answer
exports.createAnswer = async (req, res) => {
  try {
    const { content, userId, questionId } = req.body;

    const newAnswer = await db.Answer.create({
      content,
      userId,
      questionId,
    });

    res.status(201).json(newAnswer);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create answer' });
  }
};
