const express = require("express");
const router = express.Router();

const paymentController = require("../controllers/paymentController");
const verifyToken = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");

// Admin records payment
router.post(
  "/",
  verifyToken,
  checkRole("admin"),
  paymentController.recordPayment
);

// Customer self-reports payment via QR
router.post(
  "/self-report",
  verifyToken,
  paymentController.recordCustomerPayment
);

// Admin dashboard stats
router.get(
  "/stats",
  verifyToken,
  checkRole("admin"),
  paymentController.getRevenueStats
);

// payment 
router.get(
  "/monthly-revenue",
  verifyToken,
  checkRole("admin"),
  paymentController.getMonthlyRevenue
);

// Customer creates Razorpay order
router.post(
  "/razorpay/create",
  verifyToken,
  paymentController.createRazorpayOrder
);

// Customer verifies Razorpay payment
router.post(
  "/razorpay/verify",
  verifyToken,
  paymentController.verifyRazorpayPayment
);

module.exports = router;