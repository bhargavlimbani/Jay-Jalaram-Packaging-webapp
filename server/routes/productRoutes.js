const express = require("express");
const router = express.Router();

const productController = require("../controllers/productController");
const verifyToken = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");

// Admin only
router.post(
  "/",
  verifyToken,
  checkRole("admin"),
  productController.createProduct
);

// Public
router.get("/", productController.getProducts);

router.put(
  "/:id",
  verifyToken,
  checkRole("admin"),
  productController.updateProduct
);

router.delete(
  "/:id",
  verifyToken,
  checkRole("admin"),
  productController.deleteProduct
);

// low stock products
router.get(
  "/low-stock",
  verifyToken,
  checkRole("admin"),
  productController.getLowStockProducts
);

module.exports = router;
