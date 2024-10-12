const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/password-reset', authController.requestPasswordReset);
router.post('/password-reset/:confirmToken', authController.confirmPasswordReset);
router.get('/confirm/:token', authController.confirmEmail);

module.exports = router;
