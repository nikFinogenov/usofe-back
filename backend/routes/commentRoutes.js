const express = require('express');
const commentController = require('../controllers/commentController');
const router = express.Router();

// Create a new comment
router.get('/:comment_id', commentController.getComment);
router.get('/:comment_id/like', commentController.getCommentLikes);
router.post('/:comment_id/like', commentController.createCommentLike);
router.patch('/:comment_id', commentController.updateComment);
router.delete('/:comment_id', commentController.deleteComment);
router.delete('/:comment_id/like', commentController.deleteCommentLike);

module.exports = router;
