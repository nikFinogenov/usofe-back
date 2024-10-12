const express = require('express');
const postController = require('../controllers/postController');
const { isAuthenticated } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/', postController.getAllPosts);
router.get('/:post_id', postController.getPost);
router.get('/:post_id/comments', postController.getPostComments);
router.post('/:post_id/comments', isAuthenticated, postController.createComment);
router.get('/:post_id/categories', postController.getAllCategories);
router.get('/:post_id/like', postController.getAllLikes);
router.post('/', isAuthenticated, postController.createPost);
router.post('/:post_id/like', isAuthenticated, postController.createLike);
router.patch('/:post_id', isAuthenticated, postController.updatePost);
router.delete('/:post_id', isAuthenticated, postController.deletePost);
router.delete('/:post_id/like', isAuthenticated, postController.deleteLike);

module.exports = router;
