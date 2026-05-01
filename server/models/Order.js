const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./User");
const Product = require("./Product");

const Order = sequelize.define("Order", {
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  order_type: {
    type: DataTypes.ENUM("product", "custom"),
    defaultValue: "product",
  },
  total_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  items: {
    type: DataTypes.TEXT("long"),
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
  box_length: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  box_width: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  box_height: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  custom_design: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  design_file_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  design_file_data: {
    type: DataTypes.TEXT("long"),
    allowNull: true,
  },
  chat_messages: {
    type: DataTypes.TEXT("long"),
    allowNull: true,
  },
  admin_comment: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  customer_reply: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  note: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM(
        "Pending",
        "Accepted",
        "Rejected",
        "In Production",
        "Completed",
        "Delivered"
    ),
    defaultValue: "Pending",
},
});

// Relationships
User.hasMany(Order, { foreignKey: "user_id" });
Order.belongsTo(User, { foreignKey: "user_id" });

Product.hasMany(Order, { foreignKey: "product_id" });
Order.belongsTo(Product, { foreignKey: "product_id" });

module.exports = Order;
