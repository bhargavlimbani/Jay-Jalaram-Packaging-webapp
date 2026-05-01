const Order = require("../models/Order");
const sequelize = require("../config/db");

async function run() {
  await sequelize.sync();
  const order = await Order.findOne();
  console.log("Order structure:", order ? order.toJSON() : "No order");
  process.exit();
}
run();
