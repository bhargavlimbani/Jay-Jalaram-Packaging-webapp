const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Material = sequelize.define("Material", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  unit: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "kg",
  },
  quantity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  unit_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
});

module.exports = Material;
