const createTransporter = () => {
  return {
    sendMail: async (mailOptions) => {
      const { to, subject, html, attachments, from } = mailOptions;
      const senderEmail = from || process.env.MAIL_FROM || "jayjalarampackaging1@gmail.com";
      const senderName = "Jai Jalaram Packaging";

      // 1. Try Brevo (Sendinblue) API
      if (process.env.BREVO_API_KEY) {
        let brevoAttachments = undefined;
        if (attachments && attachments.length > 0) {
          brevoAttachments = attachments.map((att) => ({
            name: att.filename,
            content: Buffer.isBuffer(att.content)
              ? att.content.toString("base64")
              : Buffer.from(att.content).toString("base64"),
          }));
        }

        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            "api-key": process.env.BREVO_API_KEY,
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify({
            sender: { name: senderName, email: senderEmail },
            to: [{ email: to }],
            subject: subject,
            htmlContent: html,
            attachment: brevoAttachments,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          console.error("Brevo API Error:", errText);
          throw new Error("Email API failed");
        }
        return await response.json();
      }

      // 2. Try SendGrid API
      if (process.env.SENDGRID_API_KEY) {
        let sgAttachments = undefined;
        if (attachments && attachments.length > 0) {
          sgAttachments = attachments.map((att) => ({
            filename: att.filename,
            content: Buffer.isBuffer(att.content)
              ? att.content.toString("base64")
              : Buffer.from(att.content).toString("base64"),
            type: att.contentType || "application/pdf",
            disposition: "attachment",
          }));
        }

        const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email: to }] }],
            from: { email: senderEmail, name: senderName },
            subject: subject,
            content: [{ type: "text/html", value: html }],
            attachments: sgAttachments,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          console.error("SendGrid API Error:", errText);
          throw new Error("Email API failed");
        }
        return true;
      }

      console.error("Missing Email API Key. Provide BREVO_API_KEY or SENDGRID_API_KEY in Render.");
      throw new Error("Missing Email API Key");
    },
  };
};

module.exports = createTransporter;
