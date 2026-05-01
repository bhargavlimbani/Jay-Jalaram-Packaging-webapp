const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Order = require("./Order");   // <-- FIXED PATH

const Payment = sequelize.define("Payment", {
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  method: {
    type: DataTypes.ENUM("Cash", "UPI", "Bank Transfer"),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("Paid", "Pending"),
    defaultValue: "Paid",
  },
});

// Relationship
Order.hasOne(Payment, { foreignKey: "order_id" });
Payment.belongsTo(Order, { foreignKey: "order_id" });

module.exports = Payment;