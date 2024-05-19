const Income = require('../models/incomeModel'); 
const Expense = require('../models/expenseModel');

async function getUserBalance(userId) {
  try {
    const totalIncome = await Income.sum('amount', { where: { userId } });
    const totalExpense = await Expense.sum('amount', { where: { userId } });
    const balance = (totalIncome || 0) - (totalExpense || 0);

    return balance;
  } catch (error) {
    console.error('Error calculating user balance:', error);
    throw new Error('Unable to calculate balance');
  }
}

module.exports = getUserBalance;