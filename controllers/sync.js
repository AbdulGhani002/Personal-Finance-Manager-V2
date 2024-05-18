const sequelize = require('../data/database');
const User = require('../models/user.model');

const syncDatabase = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('Database synchronized');
  } catch (err) {
    console.error('Error synchronizing database:', err);
  }
};

syncDatabase();
