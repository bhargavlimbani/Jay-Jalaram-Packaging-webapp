const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Order = require("./Order");

const Payment = sequelize.define("Payment", {
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  method: {
    type: DataTypes.ENUM("Cash", "UPI", "Bank Transfer", "Online"),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("Paid", "Pending", "Failed"),
    defaultValue: "Paid",
  },
  transaction_id: {
    type: DataTypes.STRING,
    allowNull: true,
  }
});

// Relationship
Order.hasMany(Payment, { foreignKey: "order_id" });
Payment.belongsTo(Order, { foreignKey: "order_id" });

module.exports = Payment;