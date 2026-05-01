const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Order = require("./Order");
const User = require("./User");

const Invoice = sequelize.define("Invoice", {
  invoice_number: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  invoice_date: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW,
  },
  company_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  company_address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  gst_number: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  company_phones: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  customer_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  customer_phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  customer_address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  box_dimensions: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  is_shared_with_customer: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  shared_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  items_summary: {
    type: DataTypes.TEXT("long"),
    allowNull: true,
  },
});

Order.hasOne(Invoice, { foreignKey: "order_id" });
Invoice.belongsTo(Order, { foreignKey: "order_id" });
User.hasMany(Invoice, { foreignKey: "user_id" });
Invoice.belongsTo(User, { foreignKey: "user_id" });

module.exports = Invoice;
