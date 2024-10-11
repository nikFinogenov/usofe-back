const express = require('express');
const postController = require('../controllers/postController');
const { isAuthenticated } = require('../middlewares/authMiddleware');
const router = express.Router();

// Create a new post
router.get('/', postController.getAllPosts);//DONE
router.get('/:post_id', postController.getPost);//DONE
router.get('/:post_id/comments', postController.getPostComments);//DONE
router.post('/:post_id/comments', isAuthenticated, postController.createComment);//DONE
router.get('/:post_id/categories', postController.getAllCategories);//DONE
router.get('/:post_id/like', postController.getAllLikes);//DONE
router.post('/', isAuthenticated, postController.createPost);//DONE
router.post('/:post_id/like', isAuthenticated, postController.createLike);//DONE
router.patch('/:post_id', isAuthenticated, postController.updatePost);//DONE
router.delete('/:post_id', isAuthenticated, postController.deletePost);//DONE
router.delete('/:post_id/like', isAuthenticated, postController.deleteLike);//DONE

module.exports = router;
