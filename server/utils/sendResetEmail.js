const createTransporter = require("./emailTransporter");

const sendResetEmail = async ({ to, name, resetLink, otp }) => {
  const transporter = createTransporter();
  const fromEmail = process.env.MAIL_FROM || process.env.SMTP_USER;

  await transporter.sendMail({
    from: fromEmail,
    to,
    subject: "Reset your Jai Jalaram Packaging password",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <h2>Password Reset Request</h2>
        <p>Hello ${name || "User"},</p>
        <p>We received a request to reset your password.</p>
        <p>
          <a href="${resetLink}" style="display: inline-block; padding: 12px 18px; background: #2563eb; color: #ffffff; text-decoration: none; border-radius: 8px;">
            Reset Password
          </a>
        </p>
        <p style="margin-top: 18px;">Or use this OTP to reset your password:</p>
        <div style="display: inline-block; padding: 12px 18px; background: #f3f4f6; border-radius: 8px; font-size: 24px; font-weight: 700; letter-spacing: 6px;">
          ${otp}
        </div>
        <p>This link will expire in 15 minutes.</p>
        <p>The OTP will also expire in 15 minutes.</p>
        <p>If you did not request this, you can ignore this email.</p>
      </div>
    `,
  });
};

module.exports = sendResetEmail;
