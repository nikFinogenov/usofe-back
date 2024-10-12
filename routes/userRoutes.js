const express = require('express');
const userController = require('../controllers/userController');
const { isAuthenticated, isAdmin } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const router = express.Router();

router.get('/', isAuthenticated, isAdmin, userController.getAllUsers);
router.get('/:user_id', isAuthenticated, userController.getUser);
router.post('/', isAuthenticated, isAdmin, userController.createUser);
router.patch('/avatar', isAuthenticated, upload.single('avatar'), userController.uploadAvatar);
router.patch('/:user_id', isAuthenticated, userController.updateUser);
router.delete('/:user_id', isAuthenticated, userController.deleteUser);

module.exports = router;
