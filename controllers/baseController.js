const Income = require("../models/incomeModel");
const Expense = require("../models/expenseModel");
const Budget = require("../models/budgetModel");
const Goal = require("../models/goalModel");
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
      },
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
const showGoals = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const goals = await Goal.findAll({ where: { userId } });

    res.render("show-goals", { goals });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
};
const renderAddGoalPage = (req, res) => {
  res.render("add-goal");
};
const addGoal = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { title, description, amount, deadline } = req.body;
    await Goal.create({
      userId,
      title,
      description,
      amount,
      deadline,
    });
    return res.redirect("/home");
  } catch (error) {
    console.log(error);
    return res.redirect("/add-goal");
  }
  return;
};

const showGoal = async (req, res) => {
  try {
    const goalId = req.params.id;
    const goal = await Goal.findByPk(goalId);
    if (!goal) {
      return res.redirect("/show-goals");
    }

    const today = new Date();
    const deadline = new Date(goal.deadline);

    const monthsRemaining = calculateMonthDifference(today, deadline);
const monthlySavingsNeeded = goal.amount / monthsRemaining;
    const totalMonths =
      deadline.getMonth() -
      today.getMonth() +
      12 * (deadline.getFullYear() - today.getFullYear());
    const expectedCompletionDate = new Date(
      today.getFullYear(),
      today.getMonth() + monthsRemaining,
      today.getDate()
    ).toLocaleDateString("en-US");
    
    let suggestion = "";
    if (monthsRemaining < 0) {
      suggestion = "Goal deadline has passed.";
    } else if (monthsRemaining === 0) {
      suggestion = "Goal deadline is this month. Consider completing it soon.";
    } else if (monthsRemaining === 1) {
      suggestion = "Goal deadline is next month. Ensure you are on track.";
    } else {
      suggestion =
        "You have sufficient time to achieve your goal. Keep saving consistently.";
    }

    res.render("show-goal", {
      goal,
      monthsRemaining,
      monthlySavingsNeeded: monthlySavingsNeeded, 
      expectedCompletionDate,
      suggestion,
    });
  } catch (error) {
    console.error(error);
    res.redirect("/show-goals");
  }
};

// Function to calculate the difference in months between two dates
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
