const db = require('../models');

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
    const comment = await db.Comment.findByPk(req.params.comment_id);
    const { type } = req.body
    if (!type || (type !== "dislike" && type !== "like")) return res.status(404).json({ error: 'Type not found' });   
    if (!comment) return res.status(404).json({ error: 'Comment not found' });    

    const existingLike = await db.Like.findOne({
      where: {
        userId: req.user.id,
        commentId: req.params.comment_id
      }
    });
    if (existingLike) {
      if (existingLike.type !== type) {
        existingLike.type = type;
        await existingLike.save();
        await db.User.increment("rating", {
          by: existingLike.type == "dislike" ? -2 : 2,
          where: { id: comment.userId },
        });
        return res.status(200).json({ message: 'Like type updated successfully', like: existingLike });
      } else {
        return res.status(400).json({ error: 'You have already liked this comment with the same type' });
      }
    }
    const newLike = await db.Like.create({
      userId: req.user.id,
      commentId: req.params.comment_id,
      type: type,
    });
    await db.User.increment("rating", {
      by: type == "dislike" ? -1 : 1,
      where: { id: comment.userId },
    });

    res.status(201).json(newLike);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Failed to create like for comment' });
  }
};

exports.updateComment = async (req, res) => {
  try {
    const { content, status } = req.body;
    const comment = await db.Comment.findByPk(req.params.comment_id);

    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    if(comment.userId !== req.user.id) {
      res.status(403).json({ error: 'Unauthorized to update this comment'});
    }
    comment.content = content || comment.content;
    comment.status = status || comment.status;
    await comment.save();

    res.status(200).json(comment);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Failed to update comment' });
  }
};
exports.deleteComment = async (req, res) => {
  try {
    const comment = await db.Comment.findByPk(req.params.comment_id);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    if(comment.userId !== req.user.id) {
      res.status(403).json({ error: 'Unauthorized to delete this comment'});
    }

    await comment.destroy();
    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete comment' });
  }
};
exports.deleteCommentLike = async (req, res) => {
  try {
    const like = await db.Like.findOne({
      where: { userId: req.user.id, commentId: req.params.comment_id },
    });

    if (!like) return res.status(404).json({ error: 'Like not found' });
    const type = like.type;
    await like.destroy();

    const comment = await db.Comment.findByPk(req.params.comment_id);
    await db.User.increment("rating", {
      by: type === 'dislike' ? 1 : -1,
      where: { id: comment.userId },
    });
    res.status(200).json({ message: 'Like deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete like for comment' });
  }
};

