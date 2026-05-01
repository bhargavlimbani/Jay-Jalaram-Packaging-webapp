const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const SiteSetting = sequelize.define(
  "SiteSetting",
  {
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    value: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
    },
  },
  { timestamps: true }
);

module.exports = SiteSetting;
