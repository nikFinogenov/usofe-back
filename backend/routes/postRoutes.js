const express = require('express');
const postController = require('../controllers/postController');
const router = express.Router();

// Create a new post
router.get('/', postController.getAllPosts);
router.get('/:post_id', postController.getPost);
router.get('/:post_id/comments', postController.getPostComments);
router.post('/:post_id/comments', postController.createComment);
router.get('/:post_id/categories', postController.getAllCategories);
router.get('/:post_id/like', postController.getAllLikes);
router.post('/', postController.createPost);
router.post('/:post_id/like', postController.createLike);
router.patch('/:post_id', postController.updatePost);
router.delete('/:post_id', postController.deletePost);
router.delete('/:post_id/like', postController.deleteLike);

module.exports = router;
