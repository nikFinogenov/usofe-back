const express = require('express');
const favouriteController = require('../controllers/favouriteController');
const { isAuthenticated } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/:post_id', isAuthenticated, favouriteController.addFavourite);
router.delete('/:post_id', isAuthenticated, favouriteController.removeFavourite);
router.get('/', isAuthenticated, favouriteController.getFavourites);

module.exports = router;
