const express = require('express');
const commentController = require('../controllers/commentController');
const { isAuthenticated } = require('../middlewares/authMiddleware');
const router = express.Router();

// Create a new comment
router.get('/:comment_id', commentController.getComment);//DONE
router.get('/:comment_id/like', commentController.getCommentLikes);//DONE
router.post('/:comment_id/like', isAuthenticated, commentController.createCommentLike);//DONE
router.patch('/:comment_id', isAuthenticated, commentController.updateComment);//DONE
router.delete('/:comment_id', isAuthenticated, commentController.deleteComment);//DONE
router.delete('/:comment_id/like', isAuthenticated, commentController.deleteCommentLike);//DONE

module.exports = router;
