const nodemailer = require("nodemailer");
const dns = require("dns");

// Force IPv4 resolution to prevent ENETUNREACH errors on Render
try {
  dns.setDefaultResultOrder("ipv4first");
} catch (e) {
  // Ignore if unsupported in older Node versions
}
const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = (process.env.SMTP_USER || "").trim();
  // Gmail app passwords are often copied with spaces; remove them safely.
  const pass = (process.env.SMTP_PASS || "").replace(/\s+/g, "");

  if (!user || !pass || pass === "your-16-digit-gmail-app-password") {
    throw new Error("SMTP email settings are missing");
  }

  if (host) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
      family: 4, // force IPv4
    });
  }

  // Fallback explicitly to Gmail on port 587 (STARTTLS) instead of 465
  // Port 465 often times out or gets blocked on cloud hosts like Render
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // false for 587, true for 465
    auth: {
      user,
      pass,
    },
    family: 4, // force IPv4
  });
};

module.exports = createTransporter;
