const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const isAuthenticated = require('../middlewares/isAuthenticated');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/signup', authController.renderSignupForm);
router.get('/login', authController.renderLoginForm);
router.get('/logout', authController.logout);
router.get('/home', isAuthenticated, authController.renderHomePage);

module.exports = router;
