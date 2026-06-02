const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",      // explicit host instead of service:"gmail"
  port: 587,                   // use 587 (TLS) instead of 465 (SSL)
  secure: false,               // false for port 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // helps in local/dev environments
  },
  family: 4,                   // ✅ force IPv4 — fixes ECONNREFUSED on IPv6
});

module.exports = transporter;