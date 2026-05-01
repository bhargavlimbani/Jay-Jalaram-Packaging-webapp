const express = require("express");
const router = express.Router();

const invoiceController = require("../controllers/invoiceController");
const verifyToken = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");

router.post(
  "/",
  verifyToken,
  checkRole("admin"),
  invoiceController.generateInvoice
);
router.post(
  "/order/:orderId",
  verifyToken,
  checkRole("admin"),
  invoiceController.generateInvoice
);
router.get("/mine", verifyToken, invoiceController.getMyInvoices);
router.put(
  "/:id/share",
  verifyToken,
  checkRole("admin"),
  invoiceController.shareInvoiceToCustomer
);
router.get("/:id/pdf", verifyToken, invoiceController.downloadInvoicePdf);
router.get("/:id", verifyToken, invoiceController.getInvoiceById);
router.get(
  "/",
  verifyToken,
  checkRole("admin"),
  invoiceController.getAllInvoices
);

module.exports = router;
