const express = require('express');
const searchController = require('../controllers/searchController');
const { isAuthenticated } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/', isAuthenticated, searchController.search);

module.exports = router;
