const createTransporter = require("./emailTransporter");

const formatOrderDateTime = (value) => {
  const date = value ? new Date(value) : new Date();

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const sendOrderCompletedEmail = async ({
  to,
  name,
  orderId,
  orderedAt,
  itemsSummary,
}) => {
  const transporter = createTransporter();
  const fromEmail = process.env.MAIL_FROM || process.env.SMTP_USER;

  await transporter.sendMail({
    from: fromEmail,
    to,
    subject: "Your Jai Jalaram Packaging order is completed",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <h2 style="color: #16a34a;">Order Completed</h2>
        <p>Hello ${name || "Customer"},</p>
        <p>Your order has been completed successfully.</p>
        <div style="margin: 20px 0; padding: 16px; border-radius: 10px; background: #f3f4f6;">
          <p style="margin: 0 0 8px;"><strong>Order ID:</strong> ${orderId}</p>
          <p style="margin: 0 0 8px;"><strong>Order Date & Time:</strong> ${formatOrderDateTime(
            orderedAt
          )}</p>
          <p style="margin: 0;"><strong>Order Items:</strong> ${itemsSummary}</p>
        </div>
        <p>If you need any help, please reply to this email.</p>
      </div>
    `,
  });
};

module.exports = sendOrderCompletedEmail;
