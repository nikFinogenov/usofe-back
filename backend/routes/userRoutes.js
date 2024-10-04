const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();

// Register user
router.get('/', userController.getAllUsers);
router.get('/:user_id', userController.getUser);
router.post('/', userController.createUser);
router.patch('/avatar', userController.uploadAvatar);
router.patch('/:user_id', userController.updateUser);
router.delete('/:user_id', userController.deleteUser);

module.exports = router;
