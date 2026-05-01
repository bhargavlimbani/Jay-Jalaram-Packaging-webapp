const express = require("express");
const router = express.Router();

const orderController = require("../controllers/orderController");
const verifyToken = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");

// Customer place order
router.post("/", verifyToken, orderController.placeOrder);

// Customer view own orders
router.get("/my", verifyToken, orderController.getMyOrders);

// Customer cancel own pending order
router.delete("/:id", verifyToken, orderController.cancelMyOrder);

// Customer reply to admin
router.put("/:id/reply", verifyToken, orderController.replyToOrder);

// Shared order chat
router.get("/:id/chat", verifyToken, orderController.getOrderChat);
router.post("/:id/chat", verifyToken, orderController.sendOrderChatMessage);

// Admin view all orders  
router.get(
  "/",
  verifyToken,
  checkRole("admin"),
  orderController.getAllOrders
);

// Admin update order status
router.put(
  "/:id/status",
  verifyToken,
  checkRole("admin"),
  orderController.updateOrderStatus
);

// Admin send comment
router.put(
  "/:id/comment",
  verifyToken,
  checkRole("admin"),
  orderController.sendAdminComment
);

module.exports = router;
