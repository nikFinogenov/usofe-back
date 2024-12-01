const express = require('express');
const dateController = require('../controllers/dateController');
const router = express.Router();

router.get('/:date/posts', dateController.getDatePosts);

module.exports = router;