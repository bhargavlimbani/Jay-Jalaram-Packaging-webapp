const Order = require("../models/Order");
const Payment = require("../models/Payment");
const sequelize = require("../config/db");

async function run() {
  try {
    const orders = await Order.findAll({
      include: [Payment],
      order: [['id', 'DESC']],
      limit: 5
    });
    console.log(JSON.stringify(orders, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}
run();
