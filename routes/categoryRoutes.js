const express = require('express');
const categoryController = require('../controllers/categoryController');
const { isAuthenticated, isAdmin } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/', categoryController.getAllCategories);
router.get('/:category_id', categoryController.getCategory);
router.get('/:category_id/posts', categoryController.getCategoryPosts);
router.post('/', isAuthenticated, categoryController.createCategory);
router.patch('/:category_id', isAuthenticated, isAdmin, categoryController.updateCategory);
router.delete('/:category_id', isAuthenticated, isAdmin, categoryController.deleteCategory);

module.exports = router;
