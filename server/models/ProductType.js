const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const ProductType = sequelize.define("ProductType", {
  value: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  label: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = ProductType;
