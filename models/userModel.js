const { DataTypes } = require('sequelize');
const sequelize = require('../data/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  hooks: {
    beforeCreate: async (user) => {
      user.password = await bcrypt.hash(user.password, 12);
    },
  },
});

User.prototype.isValidPassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

User.login = async function(email, password) {
  try {
    const user = await this.findOne({ where: { email } });
    if (!user) {
      throw new Error('User not found');
    }
    const isPasswordValid = await user.isValidPassword(password);
    if (!isPasswordValid) {
      throw new Error('Incorrect password');
    }
    return user;
  } catch (err) {
    throw err;
  }
};

module.exports = User;
