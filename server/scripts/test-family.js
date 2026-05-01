const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "jayjalarampackaging1@gmail.com",
    pass: "dieb wycx hgsl ygvq".replace(/\s+/g, ""),
  },
  family: 4 // Does this work?
});

transporter.verify((err) => {
  if (err) console.log(err);
  else console.log("OK");
  process.exit();
});
