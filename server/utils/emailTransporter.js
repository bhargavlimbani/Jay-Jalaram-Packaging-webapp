const nodemailer = require("nodemailer");

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
    });
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });
};

module.exports = createTransporter;
