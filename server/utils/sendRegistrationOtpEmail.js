const createTransporter = require("./emailTransporter");

const sendRegistrationOtpEmail = async ({ to, name, otp }) => {
  const transporter = createTransporter();
  const fromEmail = process.env.MAIL_FROM || process.env.SMTP_USER;

  await transporter.sendMail({
    from: fromEmail,
    to,
    subject: "Your Jai Jalaram Packaging registration OTP",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <h2>Email Verification OTP</h2>
        <p>Hello ${name || "Customer"},</p>
        <p>Use this OTP to complete your registration:</p>
        <div style="display: inline-block; padding: 12px 18px; background: #f3f4f6; border-radius: 8px; font-size: 24px; font-weight: 700; letter-spacing: 6px;">
          ${otp}
        </div>
        <p style="margin-top: 16px;">This OTP will expire in 10 minutes.</p>
        <p>If you did not request this, you can ignore this email.</p>
      </div>
    `,
  });
};

module.exports = sendRegistrationOtpEmail;
