const express = require("express");
const router = express.Router();

const productTypeController = require("../controllers/productTypeController");
const verifyToken = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");

// Public
router.get("/", productTypeController.getProductTypes);

// Admin only
router.post("/", verifyToken, checkRole("admin"), productTypeController.createProductType);

module.exports = router;
