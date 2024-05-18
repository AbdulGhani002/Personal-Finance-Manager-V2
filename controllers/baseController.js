const Income = require("../models/incomeModel");
const Expense = require("../models/expenseModel");
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
module.exports = {
  renderAddMoneyPage,
  renderTransactionPage,
  addMoney,
  transactMoney,
};
