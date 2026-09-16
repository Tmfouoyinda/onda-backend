const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const conversationController = require('../controllers/conversationController');
const authMiddlewares = require('../middlewares/authMiddleware');

// const { body } = require('express-validator');

router.post('/send-code', authController.sendCode);

router.post('/verify-code', authController.verifyCode);

router.post('/logout', authMiddlewares.authMiddleware, authController.logout);

router.post('/refresh-token', authController.refreshToken);

router.get('/me', authMiddlewares.authMiddleware, authController.me);

router.patch('/update-profile', authMiddlewares.authMiddleware, authController.updateProfile);

router.get('/conversations', authMiddlewares.authMiddleware, conversationController.getConversations);

router.post('/conversations', authMiddlewares.authMiddleware, conversationController.createConversation);

module.exports = router;