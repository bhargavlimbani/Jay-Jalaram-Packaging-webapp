const createTransporter = require("./emailTransporter");

const formatOrderDateTime = (value) => {
  const date = value ? new Date(value) : new Date();

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const buildStatusCopy = (status) => {
  if (status === "Accepted") {
    return {
      subject: "Your Jai Jalaram Packaging order has been accepted",
      heading: "Order Accepted",
      message: "Your order has been accepted by our admin team.",
      color: "#16a34a",
    };
  }

  return {
    subject: "Your Jai Jalaram Packaging order has been rejected",
    heading: "Order Rejected",
    message: "Your order has been rejected by our admin team.",
    color: "#dc2626",
  };
};

const sendOrderStatusEmail = async ({
  to,
  name,
  status,
  orderId,
  orderedAt,
  itemsSummary,
  adminComment,
}) => {
  const transporter = createTransporter();
  const fromEmail = process.env.MAIL_FROM || process.env.SMTP_USER;
  const copy = buildStatusCopy(status);

  await transporter.sendMail({
    from: fromEmail,
    to,
    subject: copy.subject,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <h2 style="color: ${copy.color};">${copy.heading}</h2>
        <p>Hello ${name || "Customer"},</p>
        <p>${copy.message}</p>
        <div style="margin: 20px 0; padding: 16px; border-radius: 10px; background: #f3f4f6;">
          <p style="margin: 0 0 8px;"><strong>Order ID:</strong> ${orderId}</p>
          <p style="margin: 0 0 8px;"><strong>Order Date & Time:</strong> ${formatOrderDateTime(orderedAt)}</p>
          <p style="margin: 0;"><strong>Order Items:</strong> ${itemsSummary}</p>
        </div>
        ${
          adminComment
            ? `<p><strong>Admin Note:</strong> ${adminComment}</p>`
            : ""
        }
        <p>Please contact Jai Jalaram Packaging if you need any help with this order.</p>
      </div>
    `,
  });
};

module.exports = sendOrderStatusEmail;
