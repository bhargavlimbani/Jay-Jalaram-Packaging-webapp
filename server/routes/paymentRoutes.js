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

module.exports = router;