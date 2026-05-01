const express = require("express");
const router = express.Router();

const siteSettingsController = require("../controllers/siteSettingsController");
const verifyToken = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");

router.get("/", siteSettingsController.getAllSettings);
router.get("/branding", siteSettingsController.getBrandingSettings);
router.get("/home", siteSettingsController.getHomeSettings);

router.put(
  "/branding",
  verifyToken,
  checkRole("admin"),
  siteSettingsController.updateBrandingSettings
);

router.put(
  "/home",
  verifyToken,
  checkRole("admin"),
  siteSettingsController.updateHomeSettings
);

module.exports = router;
