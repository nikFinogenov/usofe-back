const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();

router.post('/register', authController.register);//DONE
router.post('/login', authController.login);//DONE
router.post('/logout', authController.logout);//DONE
router.post('/password-reset', authController.requestPasswordReset);//DONE
router.post('/password-reset/:confirmToken', authController.confirmPasswordReset);//DONE
router.get('/confirm/:token', authController.confirmEmail);//DONE

module.exports = router;
