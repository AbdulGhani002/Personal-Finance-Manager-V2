const { Model, DataTypes } = require("sequelize");
const sequelize = require("../data/database");

class Budget extends Model {}

Budget.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true, 
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    month: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    totalIncome: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    totalExpense: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    savings: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Budget",
    hooks: {
      beforeValidate: (budget, options) => {
        options.fields = options.fields.filter(field => field !== 'createdAt' && field !== 'updatedAt');
      }
    }
  }
);

module.exports = Budget;
