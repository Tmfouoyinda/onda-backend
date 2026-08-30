const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddlewares = require('../middlewares/authMiddleware');

// const { body } = require('express-validator');

router.post('/send-code', authController.sendCode);

router.post('/verify-code', authController.verifyCode);

router.post('/logout', authMiddlewares.authMiddleware, authController.logout);

router.post('/refresh-token', authController.refreshToken);

router.get('/me', authMiddlewares.authMiddleware, authController.me);

router.patch('/update-profile', authMiddlewares.authMiddleware, authController.updateProfile);

module.exports = router;