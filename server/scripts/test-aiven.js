const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.DATABASE_URL || "mysql://user:pass@host:port/dbname", {
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});
sequelize.authenticate().then(() => {
  console.log("Connected");
  process.exit(0);
}).catch((err) => {
  console.error("Failed", err);
  process.exit(1);
});
