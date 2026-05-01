const createTransporter = require("./emailTransporter");

const formatInvoiceDate = (value) => {
  const date = value ? new Date(value) : new Date();

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(date);
};

const buildInvoiceItemsList = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return "<li>Invoice items are available in the attached PDF.</li>";
  }

  return items
    .map((item) => {
      const description = item.description || "Item";
      const qty = Number(item.quantity || 0);
      const total = Number(item.total_amount || 0).toFixed(2);
      return `<li>${description} (Qty: ${qty}) - Rs. ${total}</li>`;
    })
    .join("");
};

const sendInvoiceEmail = async ({
  to,
  customerName,
  invoiceNumber,
  invoiceDate,
  totalAmount,
  pdfBuffer,
  pdfFileName,
  items,
}) => {
  const transporter = createTransporter();
  const fromEmail = process.env.MAIL_FROM || process.env.SMTP_USER;
  const safeFileName = pdfFileName || `${invoiceNumber || "invoice"}.pdf`;

  await transporter.sendMail({
    from: fromEmail,
    to,
    subject: `Invoice ${invoiceNumber || ""} from Jai Jalaram Packaging`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <h2 style="color: #0f172a;">Your invoice is ready</h2>
        <p>Hello ${customerName || "Customer"},</p>
        <p>Please find your invoice attached.</p>
        <div style="margin: 16px 0; padding: 16px; border-radius: 10px; background: #f8fafc;">
          <p style="margin: 0 0 8px;"><strong>Invoice No:</strong> ${invoiceNumber || "-"}</p>
          <p style="margin: 0 0 8px;"><strong>Date:</strong> ${formatInvoiceDate(
            invoiceDate
          )}</p>
          <p style="margin: 0;"><strong>Total:</strong> Rs. ${Number(
            totalAmount || 0
          ).toFixed(2)}</p>
        </div>
        <p style="margin: 0 0 8px;"><strong>Items:</strong></p>
        <ul style="margin-top: 0; padding-left: 18px;">
          ${buildInvoiceItemsList(items)}
        </ul>
        <p>If you need help, please reply to this email.</p>
      </div>
    `,
    attachments: pdfBuffer
      ? [
          {
            filename: safeFileName,
            content: pdfBuffer,
            contentType: "application/pdf",
          },
        ]
      : [],
  });
};

module.exports = sendInvoiceEmail;