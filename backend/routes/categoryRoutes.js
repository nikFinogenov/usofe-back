const express = require('express');
const categoryController = require('../controllers/categoryController');
const router = express.Router();

// Create a new comment
router.get('/', categoryController.getAllCategories);
router.get('/:category_id', categoryController.getCategory);
router.get('/:category_id/posts', categoryController.getCategoryPosts);
router.post('/:category_id', categoryController.createCategory);
router.patch('/:category_id', categoryController.updateCategory);
router.delete('/:category_id', categoryController.deleteCategory);

module.exports = router;
