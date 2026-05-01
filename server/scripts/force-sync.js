const sequelize = require("../config/db");
require("../models/Product");
require("../models/Order");
require("../models/Invoice");
require("../models/PendingRegistration");
require("../models/Material");
require("../models/User");
require("../models/Payment");
require("../models/SiteSetting");
require("../models/ProductType");

async function run() {
  try {
    console.log("Starting DB alter sync...");
    await sequelize.sync({ alter: true });
    console.log("DB sync complete!");
  } catch (err) {
    console.error("Sync error:", err);
  } finally {
    process.exit();
  }
}

run();
