const express = require('express');
const commentController = require('../controllers/commentController');
const { isAuthenticated } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/:comment_id', commentController.getComment);
router.get('/:comment_id/like', commentController.getCommentLikes);
router.post('/:comment_id/like', isAuthenticated, commentController.createCommentLike);
router.patch('/:comment_id', isAuthenticated, commentController.updateComment);
router.delete('/:comment_id', isAuthenticated, commentController.deleteComment);
router.delete('/:comment_id/like', isAuthenticated, commentController.deleteCommentLike);

module.exports = router;
