const express = require('express');
const categoryController = require('../controllers/categoryController');
const { isAuthenticated, isAdmin } = require('../middlewares/authMiddleware');
const router = express.Router();

// Create a new comment
router.get('/', categoryController.getAllCategories);//DONE
router.get('/:category_id', categoryController.getCategory);//DONE
router.get('/:category_id/posts', categoryController.getCategoryPosts);//DONE
router.post('/', isAuthenticated, isAdmin, categoryController.createCategory);//DONE
router.patch('/:category_id', isAuthenticated, isAdmin, categoryController.updateCategory);//DONE
router.delete('/:category_id', isAuthenticated, isAdmin, categoryController.deleteCategory);//DONE

module.exports = router;
