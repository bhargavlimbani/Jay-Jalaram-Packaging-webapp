const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const PendingRegistration = sequelize.define("PendingRegistration", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  otp_hash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  otp_expires_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: "pending_registrations",
});

module.exports = PendingRegistration;
