const User = require("../models/User");
const PendingRegistration = require("../models/PendingRegistration");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { Op } = require("sequelize");
const sendResetEmail = require("../utils/sendResetEmail");
const sendRegistrationOtpEmail = require("../utils/sendRegistrationOtpEmail");

const isValidEmail = (email = "") => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const normalizeEmail = (email = "") => email.trim().toLowerCase();
const hashValue = (value = "") => crypto.createHash("sha256").update(value).digest("hex");

const parseOrderItems = (order) => {
  try {
    const parsed = order.items ? JSON.parse(order.items) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

exports.sendRegistrationOtp = async (req, res) => {
  try {
    const { name, email, phone, address, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!name?.trim() || !normalizedEmail || !password?.trim()) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    if (password.trim().length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ where: { email: normalizedEmail } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const hashedPassword = await bcrypt.hash(password.trim(), 10);
    const otpHash = hashValue(otp);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await PendingRegistration.upsert({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone?.trim() || null,
      address: address?.trim() || null,
      password_hash: hashedPassword,
      otp_hash: otpHash,
      otp_expires_at: otpExpiry,
    });

    await sendRegistrationOtpEmail({
      to: normalizedEmail,
      name: name.trim(),
      otp,
    });

    res.json({
      message: `OTP sent to ${normalizedEmail}`,
    });
  } catch (error) {
    if (error.message === "SMTP email settings are missing") {
      return res.status(500).json({
        message: "Please add your real Gmail App Password in server/.env for SMTP_PASS",
      });
    }

    if (error.code === "EAUTH") {
      return res.status(500).json({
        message: "Gmail login failed. Check SMTP_USER and Gmail App Password in server/.env",
      });
    }

    res.status(500).json({ message: "Unable to send OTP email right now" });
  }
};

// REGISTER
exports.register = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    if (!otp || !/^\d{6}$/.test(String(otp).trim())) {
      return res.status(400).json({ message: "Please enter a valid 6-digit OTP" });
    }

    const existingUser = await User.findOne({ where: { email: normalizedEmail } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const pendingRegistration = await PendingRegistration.findOne({
      where: {
        email: normalizedEmail,
        otp_expires_at: {
          [Op.gt]: new Date(),
        },
      },
    });

    if (!pendingRegistration) {
      return res.status(400).json({ message: "OTP is invalid or expired. Please request a new OTP." });
    }

    const isOtpValid = pendingRegistration.otp_hash === hashValue(String(otp).trim());
    if (!isOtpValid) {
      return res.status(400).json({ message: "OTP is incorrect" });
    }

    const user = await User.create({
      name: pendingRegistration.name,
      email: pendingRegistration.email,
      phone: pendingRegistration.phone,
      address: pendingRegistration.address,
      password: pendingRegistration.password_hash,
    });

    await pendingRegistration.destroy();

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = normalizeEmail(email);

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    const user = await User.findOne({ where: { email: normalizedEmail } });
    if (!user) {
      return res.status(400).json({ message: "Email is not registered" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Password is incorrect" });
    }

    // 👇 Define admin emails
    const adminEmails = [
      "limbanibhargavmaheshbhai@gmail.com",
      "jayjalarampackaging1@gmail.com",
      "bhargavlimbani396@gmail.com"
    ];

    // 👇 Decide role dynamically
    const role = adminEmails.includes(normalizedEmail) ? "admin" : "customer";

    const token = jwt.sign(
      { id: user.id, role: role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: role
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { name, email, phone, address } = req.body;

    const normalizedEmail = email ? normalizeEmail(email) : null;

    if (normalizedEmail && !isValidEmail(normalizedEmail)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    if (normalizedEmail && normalizedEmail !== user.email) {
      const existingUser = await User.findOne({ where: { email: normalizedEmail } });

      if (existingUser && existingUser.id !== user.id) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    await user.update({
      name: name ?? user.name,
      email: normalizedEmail ?? user.email,
      phone: phone ?? user.phone,
      address: address ?? user.address,
    });

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCustomers = async (req, res) => {
  try {
    const customers = await User.findAll({
      where: {
        role: {
          [Op.in]: ["customer", "admin"],
        },
      },
      attributes: ["id", "name", "email", "phone", "address", "role", "createdAt"],
      order: [["createdAt", "DESC"]],
    });

    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCustomerDetails = async (req, res) => {
  try {
    const Order = require("../models/Order");
    const Product = require("../models/Product");
    const Invoice = require("../models/Invoice");

    const customer = await User.findOne({
      where: {
        id: req.params.id,
      },
      attributes: ["id", "name", "email", "phone", "address", "role", "createdAt"],
      include: [
        {
          model: Order,
          include: [Product, Invoice],
        },
      ],
      order: [[Order, "createdAt", "DESC"]],
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const plainCustomer = customer.toJSON();
    plainCustomer.Orders = Array.isArray(plainCustomer.Orders)
      ? plainCustomer.Orders.map((order) => ({
          ...order,
          items: parseOrderItems(order),
        }))
      : [];

    res.json(plainCustomer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const normalizedEmail = normalizeEmail(email);

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    const user = await User.findOne({ where: { email: normalizedEmail } });

    if (!user) {
      return res.status(404).json({ message: "Email is not registered" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetOtp = String(Math.floor(100000 + Math.random() * 900000));
    const resetExpiry = new Date(Date.now() + 15 * 60 * 1000);
    const frontendBaseUrl = process.env.CLIENT_URL || "http://localhost:3000";
    const resetLink = `${frontendBaseUrl}/reset-password/${resetToken}`;

    await user.update({
      reset_password_token: resetToken,
      reset_password_expires: resetExpiry,
      reset_password_otp_hash: hashValue(resetOtp),
      reset_password_otp_expires: resetExpiry,
    });

    await sendResetEmail({
      to: user.email,
      name: user.name,
      resetLink,
      otp: resetOtp,
    });

    res.json({ message: `Password reset link and OTP sent to ${user.email}` });
  } catch (error) {
    if (error.message === "SMTP email settings are missing") {
      return res.status(500).json({
        message: "Please add your real Gmail App Password in server/.env for SMTP_PASS",
      });
    }

    if (error.code === "EAUTH") {
      return res.status(500).json({
        message: "Gmail login failed. Check SMTP_USER and Gmail App Password in server/.env",
      });
    }

    res.status(500).json({ message: "Unable to send reset email right now" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.trim().length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({
      where: {
        reset_password_token: token,
        reset_password_expires: {
          [Op.gt]: new Date(),
        },
      },
    });

    if (!user) {
      return res.status(400).json({ message: "Reset link is invalid or expired" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await user.update({
      password: hashedPassword,
      reset_password_token: null,
      reset_password_expires: null,
      reset_password_otp_hash: null,
      reset_password_otp_expires: null,
    });

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: "Unable to reset password right now" });
  }
};

exports.resetPasswordWithOtp = async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    if (!otp || !/^\d{6}$/.test(String(otp).trim())) {
      return res.status(400).json({ message: "Please enter a valid 6-digit OTP" });
    }

    if (!password || password.trim().length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({
      where: {
        email: normalizedEmail,
        reset_password_otp_expires: {
          [Op.gt]: new Date(),
        },
      },
    });

    if (!user || user.reset_password_otp_hash !== hashValue(String(otp).trim())) {
      return res.status(400).json({ message: "OTP is invalid or expired" });
    }

    const hashedPassword = await bcrypt.hash(password.trim(), 10);

    await user.update({
      password: hashedPassword,
      reset_password_token: null,
      reset_password_expires: null,
      reset_password_otp_hash: null,
      reset_password_otp_expires: null,
    });

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: "Unable to reset password right now" });
  }
};

    // // 🔥 ADMIN CONDITION ADDED HERE
    // if (user.role !== "admin") {
    //   return res.status(403).json({
    //     message: "Access denied. Admin only."
    //   });
    // }