const db = require('../models');

// Create a comment
exports.getComment = async (req, res) => {
  try {
    const comment = await db.Comment.findByPk(req.params.comment_id);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    res.status(200).json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve comment' });
  }
};
exports.getCommentLikes = async (req, res) => {
  try {
    const likes = await db.Like.findAll({
      where: { commentId: req.params.comment_id, type: 'like' }
    });
    res.status(200).json(likes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve likes for comment' });
  }
};
exports.createCommentLike = async (req, res) => {
  try {
    const { userId } = req.body;
    const comment = await db.Comment.findByPk(req.params.comment_id);

    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    const newLike = await db.Like.create({
      authorId: userId,
      commentId: req.params.comment_id,
      type: 'like',
    });

    res.status(201).json(newLike);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create like for comment' });
  }
};
exports.updateComment = async (req, res) => {
  try {
    const { content } = req.body;
    const comment = await db.Comment.findByPk(req.params.comment_id);

    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    comment.content = content || comment.content;
    await comment.save();

    res.status(200).json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update comment' });
  }
};
exports.deleteComment = async (req, res) => {
  try {
    const comment = await db.Comment.findByPk(req.params.comment_id);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    await comment.destroy();
    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete comment' });
  }
};
exports.deleteCommentLike = async (req, res) => {
  try {
    const { userId } = req.body;
    const like = await db.Like.findOne({
      where: { authorId: userId, commentId: req.params.comment_id, type: 'like' },
    });

    if (!like) return res.status(404).json({ error: 'Like not found' });

    await like.destroy();
    res.status(200).json({ message: 'Like deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete like for comment' });
  }
};

