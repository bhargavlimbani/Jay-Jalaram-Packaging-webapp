const { Sequelize } = require("sequelize");
const fs = require("fs");
const path = require("path");

const dbUrl = process.env.DB_URL || null;
const dbName = process.env.DB_NAME || "jai_jalaram";
const dbUser = process.env.DB_USER || "root";
const dbPass = process.env.DB_PASSWORD || process.env.DB_PASS || "";
const dbHost = process.env.DB_HOST || "localhost";
const dbDialect = process.env.DB_DIALECT || "mysql";
const dbPort = process.env.DB_PORT || 3306;
const dbSsl = process.env.DB_SSL === 'true';

// Helper to load CA certificate if path is provided
const getCaCert = () => {
  if (process.env.DB_SSL_CA) {
    try {
      // Resolve path relative to the server root (one directory up from config)
      const caPath = path.resolve(__dirname, '..', process.env.DB_SSL_CA);
      return fs.readFileSync(caPath);
    } catch (err) {
      console.error("Failed to read CA certificate file:", err.message);
      return undefined;
    }
  }
  return undefined;
};

const dialectOptions = dbSsl
  ? {
      ssl: {
        rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true',
        ca: getCaCert(),
      },
    }
  : undefined;

const sequelize = dbUrl
  ? new Sequelize(dbUrl, {
      dialect: dbDialect,
      dialectOptions: dialectOptions,
    })
  : new Sequelize(dbName, dbUser, dbPass, {
      host: dbHost,
      port: dbPort,
      dialect: dbDialect,
      dialectOptions: dialectOptions,
    });

sequelize
  .authenticate()
  .then(() => console.log("MySQL Connected ✅"))
  .catch((err) => console.error("MySQL Connection Failed ❌", err));

module.exports = sequelize;
