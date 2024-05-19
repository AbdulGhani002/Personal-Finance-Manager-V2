const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const baseController = require('../controllers/baseController');
const isAuthenticated = require('../middlewares/isAuthenticated');
router.get('/' ,isAuthenticated, authController.renderHomePage);
router.get('/add-money', isAuthenticated, baseController.renderAddMoneyPage);
router.get('/transaction-page' , isAuthenticated, baseController.renderTransactionPage);
router.post('/add-money', isAuthenticated, baseController.addMoney);
router.post('/transact-money', isAuthenticated, baseController.transactMoney);
router.get('/show-report' , isAuthenticated , baseController.showReport)
router.get('/show-budget' , isAuthenticated , baseController.showBudget)
router.get('/show-goals' , isAuthenticated , baseController.showGoals)
router.get('/add-goal' , isAuthenticated , baseController.renderAddGoalPage)
router.post('/add-goal' , isAuthenticated , baseController.addGoal)
router.get('/show-goal/:id' , isAuthenticated , baseController.showGoal)
module.exports = router;