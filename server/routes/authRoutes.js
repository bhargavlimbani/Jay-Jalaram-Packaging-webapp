const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const verifyToken = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");

router.post("/register/send-otp", authController.sendRegistrationOtp);
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:token", authController.resetPassword);
router.post("/reset-password-otp", authController.resetPasswordWithOtp);
router.get("/profile", verifyToken, authController.getProfile);
router.put("/profile", verifyToken, authController.updateProfile);
router.get(
  "/customers",
  verifyToken,
  checkRole("admin"),
  authController.getCustomers
);
router.get(
  "/customers/:id",
  verifyToken,
  checkRole("admin"),
  authController.getCustomerDetails
);

module.exports = router;
