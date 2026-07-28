const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// const { body } = require('express-validator');

router.post('/send-code', authController.sendCode);

module.exports = router;