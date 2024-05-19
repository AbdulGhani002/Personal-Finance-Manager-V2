const Income = require("../models/incomeModel");
const Expense = require("../models/expenseModel");
const Budget = require("../models/budgetModel");
const { Op } = require("sequelize");
const renderAddMoneyPage = (req, res) => {
  res.render("add-money");
};
const renderTransactionPage = (req, res) => {
  res.render("transaction-page");
};
const addMoney = (req, res) => {
  const { amount, date, description } = req.body;
  const userId = req.session.user.id;
  Income.create({
    amount,
    date,
    description,
    userId,
  });
  res.redirect("/");
};
const transactMoney = (req, res) => {
  const { amount, date, description } = req.body;
  const userId = req.session.user.id;
  Expense.create({
    amount,
    date,
    description,
    userId,
  });
  res.redirect("/");
};
const showReport = async (req, res) => {
  const user = req.session.user;
  const userId = user.id;
  const totalIncome = await Income.sum("amount", { where: { userId } });
  const totalExpense = await Expense.sum("amount", { where: { userId } });
  const balance = totalIncome - totalExpense;
  const incomeDetails = await Income.findAll({ where: { userId } });
  const expenseDetails = await Expense.findAll({ where: { userId } });
  res.render("show-report", {
    user,
    totalIncome,
    totalExpense,
    balance,
    incomeDetails,
    expenseDetails,
  });
};

const showBudget = async (req, res) => {
  try {
    const user = req.session.user;
    const userId = user.id;
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    let [currentBudget, created] = await Budget.findOrCreate({
      where: { userId, month: currentMonth, year: currentYear },
      defaults: {
        userId,
        month: currentMonth,
        year: currentYear,
        totalIncome: 0,
        totalExpense: 0,
        savings: 0,
      }
    });
    
    const incomeDetails = await Income.findAll({ where: { userId } });
    const expenseDetails = await Expense.findAll({ where: { userId } });

    const totalIncome = incomeDetails.reduce(
      (total, income) => total + income.amount,
      0
    );
    const totalExpense = expenseDetails.reduce(
      (total, expense) => total + expense.amount,
      0
    );

    currentBudget.totalIncome = totalIncome;
    currentBudget.totalExpense = totalExpense;
    currentBudget.savings = totalIncome - totalExpense;
    await currentBudget.save();

    const allBudgets = await Budget.findAll({ where: { userId } });

    res.render("show-budget", { user, currentBudget, allBudgets });
  } catch (error) {
    console.error("Error in showBudget function:", error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  renderAddMoneyPage,
  renderTransactionPage,
  addMoney,
  transactMoney,
  showReport,
  showBudget,
};
