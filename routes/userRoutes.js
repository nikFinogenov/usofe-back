const express = require('express');
const userController = require('../controllers/userController');
const { isAuthenticated, isAdmin } = require('../middlewares/authMiddleware'); // Custom middleware for authentication
const upload = require('../middlewares/uploadMiddleware'); // Assuming you use multer for file uploads
const router = express.Router();

// Register user
router.get('/', isAuthenticated, isAdmin, userController.getAllUsers);//DONE
router.get('/:user_id', isAuthenticated, userController.getUser);//DONE
router.post('/', isAuthenticated, isAdmin, userController.createUser);//DONE
router.patch('/avatar', isAuthenticated, upload.single('avatar'), userController.uploadAvatar);//DONE
router.patch('/:user_id', isAuthenticated, userController.updateUser);//DONE
router.delete('/:user_id', isAuthenticated, userController.deleteUser);//DONE

module.exports = router;
