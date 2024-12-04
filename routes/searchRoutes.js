const express = require('express');
const searchController = require('../controllers/searchController');
const { isAuthenticated } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/', searchController.search);

module.exports = router;
