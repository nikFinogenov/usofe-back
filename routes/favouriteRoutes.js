const express = require('express');
const favoriteController = require('../controllers/favouriteController');
const { isAuthenticated } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/:post_id', isAuthenticated, favoriteController.addFavorite);
router.delete('/:post_id', isAuthenticated, favoriteController.removeFavorite);
router.get('/', isAuthenticated, favoriteController.getFavorites);

module.exports = router;
