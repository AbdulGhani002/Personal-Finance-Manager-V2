const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const isAuthenticated = require('../middlewares/isAuthenticated');
router.get('/' ,isAuthenticated, authController.renderHomePage);

module.exports = router;
