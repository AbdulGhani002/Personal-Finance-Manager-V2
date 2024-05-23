const Income = require("../models/incomeModel");
const Expense = require("../models/expenseModel");
const Budget = require("../models/budgetModel");
const Goal = require("../models/goalModel");

const renderAddMoneyPage = (req, res) => res.render("add-money");

const renderTransactionPage = (req, res) => res.render("transaction-page");

const addMoney = async (req, res) => {
  const { amount, date, description } = req.body;
  const userId = req.session.user.id;
  try {
    await Income.create({ amount, date, description, userId });
    res.redirect("/");
  } catch (error) {
    res.status(500).send("Error adding money");
  }
};

const transactMoney = async (req, res) => {
  const { amount, date, description } = req.body;
  const userId = req.session.user.id;

  try {
    const totalIncome = await Income.sum("amount", { where: { userId } }) || 0;
    const totalExpense = await Expense.sum("amount", { where: { userId } }) || 0;
    const currentBalance = totalIncome - totalExpense;

    if (currentBalance >= amount) {
      await Expense.create({ amount, date, description, userId });
      res.redirect("/");
    } else {
      res.status(400).send("Insufficient balance");
    }
  } catch (error) {
    res.status(500).send("Error making transaction");
  }
};


const showReport = async (req, res) => {
  const userId = req.session.user.id;
  try {
    const totalIncome = await Income.sum("amount", { where: { userId } });
    const totalExpense = await Expense.sum("amount", { where: { userId } });
    const balance = totalIncome - totalExpense;
    const incomeDetails = await Income.findAll({ where: { userId } });
    const expenseDetails = await Expense.findAll({ where: { userId } });

    res.render("show-report", {
      user: req.session.user,
      totalIncome,
      totalExpense,
      balance,
      incomeDetails,
      expenseDetails,
    });
  } catch (error) {
    res.status(500).send("Error generating report");
  }
};

const showBudget = async (req, res) => {
  const userId = req.session.user.id;
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  try {
    const [currentBudget, created] = await Budget.findOrCreate({
      where: { userId, month: currentMonth, year: currentYear },
      defaults: { userId, month: currentMonth, year: currentYear, totalIncome: 0, totalExpense: 0, savings: 0 },
    });

    const incomeDetails = await Income.findAll({ where: { userId } });
    const expenseDetails = await Expense.findAll({ where: { userId } });

    const totalIncome = incomeDetails.reduce((total, income) => total + income.amount, 0);
    const totalExpense = expenseDetails.reduce((total, expense) => total + expense.amount, 0);

    currentBudget.totalIncome = totalIncome;
    currentBudget.totalExpense = totalExpense;
    currentBudget.savings = totalIncome - totalExpense;
    await currentBudget.save();

    const allBudgets = await Budget.findAll({ where: { userId } });

    res.render("show-budget", { user: req.session.user, currentBudget, allBudgets });
  } catch (error) {
    console.error("Error in showBudget function:", error);
    res.status(500).send("Internal Server Error");
  }
};

const showGoals = async (req, res) => {
  const userId = req.session.user.id;
  try {
    const goals = await Goal.findAll({ where: { userId } });
    res.render("show-goals", { goals });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
};

const renderAddGoalPage = (req, res) => res.render("add-goal");

const addGoal = async (req, res) => {
  const userId = req.session.user.id;
  const { title, description, amount, deadline } = req.body;
  try {
    await Goal.create({ userId, title, description, amount, deadline });
    res.redirect("/home");
  } catch (error) {
    console.error(error);
    res.redirect("/add-goal");
  }
};

const showGoal = async (req, res) => {
  const goalId = req.params.id;
  try {
    const goal = await Goal.findByPk(goalId);
    if (!goal) {
      return res.redirect("/show-goals");
    }

    const today = new Date();
    const deadline = new Date(goal.deadline);
    const monthsRemaining = calculateMonthDifference(today, deadline);
    const monthlySavingsNeeded = goal.amount / monthsRemaining;
    const expectedCompletionDate = new Date(today.getFullYear(), today.getMonth() + monthsRemaining, today.getDate()).toLocaleDateString("en-US");

    let suggestion;
    if (monthsRemaining < 0) {
      suggestion = "Goal deadline has passed.";
    } else if (monthsRemaining === 0) {
      suggestion = "Goal deadline is this month. Consider completing it soon.";
    } else if (monthsRemaining === 1) {
      suggestion = "Goal deadline is next month. Ensure you are on track.";
    } else {
      suggestion = "You have sufficient time to achieve your goal. Keep saving consistently.";
    }

    res.render("show-goal", { goal, monthsRemaining, monthlySavingsNeeded, expectedCompletionDate, suggestion });
  } catch (error) {
    console.error(error);
    res.redirect("/show-goals");
  }
};

function calculateMonthDifference(date1, date2) {
  let diffMonths = (date2.getFullYear() - date1.getFullYear()) * 12;
  diffMonths -= date1.getMonth();
  diffMonths += date2.getMonth();
  return diffMonths <= 0 ? 0 : diffMonths;
}

module.exports = {
  renderAddMoneyPage,
  renderTransactionPage,
  addMoney,
  transactMoney,
  showReport,
  showBudget,
  renderAddGoalPage,
  showGoals,
  addGoal,
  showGoal,
};
