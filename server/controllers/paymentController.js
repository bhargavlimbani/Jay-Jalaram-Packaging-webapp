const Payment = require("../models/Payment");
const Order = require("../models/Order");

// Record Payment (Admin Only)
exports.recordPayment = async (req, res) => {
  try {
    const { order_id, method } = req.body;

    const order = await Order.findByPk(order_id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const payment = await Payment.create({
      order_id,
      amount: order.total_price,
      method,
      status: "Paid",
    });

    res.status(201).json(payment);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Dashboard Revenue
exports.getRevenueStats = async (req, res) => {
  try {
    const totalRevenue = await Payment.sum("amount");

    const totalOrders = await Order.count();

    const paidOrders = await Payment.count();

    res.json({
      totalRevenue: totalRevenue || 0,
      totalOrders,
      paidOrders,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//payment controller
const sequelize = require("../config/db");

exports.getMonthlyRevenue = async (req, res) => {
  try {
    const result = await sequelize.query(`
      SELECT 
        DATE_FORMAT(createdAt, '%Y-%m') AS month,
        SUM(amount) AS revenue
      FROM Payments
      GROUP BY month
      ORDER BY month ASC
    `);

    res.json(result[0]);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};