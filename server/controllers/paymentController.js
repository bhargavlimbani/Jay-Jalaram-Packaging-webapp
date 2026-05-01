const Payment = require("../models/Payment");
const Order = require("../models/Order");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const sequelize = require("../config/db");

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_mock_key_id",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "rzp_test_mock_secret",
});

// Helper function to update order payment status
const updateOrderPaymentStatus = async (orderId) => {
  const order = await Order.findByPk(orderId);
  if (!order) return;

  const payments = await Payment.findAll({ where: { order_id: orderId, status: "Paid" } });
  
  let totalPaid = 0;
  payments.forEach((p) => {
    totalPaid += parseFloat(p.amount);
  });

  if (totalPaid >= parseFloat(order.total_price)) {
    order.payment_status = "Paid";
  } else if (totalPaid > 0) {
    order.payment_status = "Partially Paid";
  } else {
    order.payment_status = "Unpaid";
  }
  
  await order.save();
  return { totalPaid, paymentStatus: order.payment_status };
};

// Record Offline Payment (Admin)
exports.recordPayment = async (req, res) => {
  try {
    const { order_id, method, amount } = req.body;

    const order = await Order.findByPk(order_id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const payAmount = amount ? parseFloat(amount) : parseFloat(order.total_price);

    const payment = await Payment.create({
      order_id,
      amount: payAmount,
      method,
      status: "Paid",
    });

    const statusUpdate = await updateOrderPaymentStatus(order_id);

    res.status(201).json({ payment, statusUpdate });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Record Online Payment (Customer self-reporting after scanning QR)
exports.recordCustomerPayment = async (req, res) => {
  try {
    const { order_id, amount } = req.body;

    const order = await Order.findByPk(order_id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const payAmount = amount ? parseFloat(amount) : parseFloat(order.total_price);

    const payment = await Payment.create({
      order_id,
      amount: payAmount,
      method: "Online",
      status: "Paid",
      transaction_id: "Self-Reported UPI",
    });

    const statusUpdate = await updateOrderPaymentStatus(order_id);

    res.status(201).json({ payment, statusUpdate });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create Razorpay Order
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { order_id, amount } = req.body;

    const order = await Order.findByPk(order_id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Amount should be in paise (multiply by 100)
    const options = {
      amount: Math.round(parseFloat(amount) * 100),
      currency: "INR",
      receipt: `receipt_order_${order_id}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);
    
    res.json({
      success: true,
      razorpayOrder,
      key_id: razorpay.key_id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Verify Razorpay Payment
exports.verifyRazorpayPayment = async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      order_id,
      amount 
    } = req.body;

    // Verify signature
    const hmac = crypto.createHmac("sha256", razorpay.key_secret);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid Signature" });
    }

    // Payment is authentic, record it
    const payment = await Payment.create({
      order_id,
      amount: parseFloat(amount),
      method: "Online",
      status: "Paid",
      transaction_id: razorpay_payment_id
    });

    const statusUpdate = await updateOrderPaymentStatus(order_id);

    res.json({ success: true, payment, statusUpdate });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Dashboard Revenue
exports.getRevenueStats = async (req, res) => {
  try {
    const totalRevenue = await Payment.sum("amount", { where: { status: "Paid" } });
    const totalOrders = await Order.count();
    const paidOrders = await Payment.count({ where: { status: "Paid" } });

    res.json({
      totalRevenue: totalRevenue || 0,
      totalOrders,
      paidOrders,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Monthly Revenue
exports.getMonthlyRevenue = async (req, res) => {
  try {
    const result = await sequelize.query(`
      SELECT 
        DATE_FORMAT(createdAt, '%Y-%m') AS month,
        SUM(amount) AS revenue
      FROM Payments
      WHERE status = 'Paid'
      GROUP BY month
      ORDER BY month ASC
    `);

    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};