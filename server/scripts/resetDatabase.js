require("dotenv").config();

const { Sequelize } = require("sequelize");

const dbName = process.env.DB_NAME || "jai_jalaram";
const dbUser = process.env.DB_USER || "root";
const dbPass = process.env.DB_PASSWORD || process.env.DB_PASS || "";
const dbHost = process.env.DB_HOST || "localhost";
const dbDialect = process.env.DB_DIALECT || "mysql";
const dbPort = process.env.DB_PORT || 3306;
const dbSsl = process.env.DB_SSL === 'true';

const ensureFreshDatabase = async () => {
  if (process.env.RESET_DB_DROP_DATABASE !== "true") return;

  console.log(`Dropping and recreating database "${dbName}"...`);
  const adminSequelize = new Sequelize("mysql", dbUser, dbPass, {
    host: dbHost,
    port: dbPort,
    dialect: dbDialect,
    logging: false,
    dialectOptions: dbSsl ? {
      ssl: {
        rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true',
        ca: process.env.DB_SSL_CA || undefined,
      }
    } : undefined,
  });

  await adminSequelize.query(`DROP DATABASE IF EXISTS \`${dbName}\``);
  await adminSequelize.query(`CREATE DATABASE \`${dbName}\``);
  await adminSequelize.close();
};

const resetDatabase = async () => {
  if (process.env.RESET_DB !== "true") {
    throw new Error(
      "RESET_DB is not set to true. Set RESET_DB=true in your environment to allow a full reset."
    );
  }

  await ensureFreshDatabase();

  const sequelize = require("../config/db");

  // Load models to register them with Sequelize
  require("../models/Product");
  require("../models/Order");
  require("../models/Invoice");
  require("../models/PendingRegistration");
  require("../models/Material");
  require("../models/User");
  require("../models/Payment");

  console.log("Dropping all tables...");
  await sequelize.drop();

  console.log("Recreating tables...");
  await sequelize.sync();

  console.log("Database reset complete.");
};

resetDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Database reset failed:", error.message);
    process.exit(1);
  });
