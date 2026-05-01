const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.DATABASE_URL || "mysql://user:pass@host:port/dbname", {
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: true // testing if it works natively
    }
  }
});
sequelize.authenticate().then(() => {
  console.log("Connected Securely with rejectUnauthorized: true");
  process.exit(0);
}).catch((err) => {
  console.error("Failed", err.message);
  process.exit(1);
});
