const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",      // force hostname instead of "service: gmail"
  port: 587,                   // 587 works where 465 is blocked
  secure: false,               // false = STARTTLS (not SSL)
  family: 4,                   // force IPv4, prevents ECONNREFUSED on IPv6
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // fixes self-signed certificate error
  },
});

const STATUS_CONFIG = {
  Placed: {
    emoji: "🎉",
    subject: "Order Placed Successfully! — Eatoz",
    color: "#3b82f6",
    heading: "Your order has been placed!",
    message: "We've received your order and it will be prepared shortly. Thank you for ordering with Eatoz!",
    cta: "Track Your Order",
  },
  Preparing: {
    emoji: "👨‍🍳",
    subject: "Your Order is Being Prepared — Eatoz",
    color: "#f59e0b",
    heading: "Your order is being prepared!",
    message: "Our chefs are working hard to prepare your delicious meal. It will be on its way very soon!",
    cta: "Track Your Order",
  },
  "On the Way": {
    emoji: "🚴",
    subject: "Your Order is On the Way! — Eatoz",
    color: "#8b5cf6",
    heading: "Your food is on the way!",
    message: "Your order is out for delivery. Get ready to enjoy your meal — it will arrive at your doorstep shortly!",
    cta: "Track Delivery",
  },
  Delivered: {
    emoji: "✅",
    subject: "Order Delivered! Enjoy Your Meal — Eatoz",
    color: "#10b981",
    heading: "Your order has been delivered!",
    message: "We hope you enjoy your meal! Thank you for choosing Eatoz. We'd love to see you again soon.",
    cta: "Order Again",
  },
  Cancelled: {
    emoji: "❌",
    subject: "Order Cancelled — Eatoz",
    color: "#ef4444",
    heading: "Your order has been cancelled.",
    message: "We're sorry your order was cancelled. If you have any questions, please contact our support team. We hope to serve you again soon!",
    cta: "Place a New Order",
  },
};

const sendOrderStatusEmail = async ({ toEmail, toName, orderId, status, items = [], total }) => {
  const config = STATUS_CONFIG[status];
  if (!config) return;

  const itemsHtml = items.length
    ? `
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <thead>
          <tr style="background:#f8fafc;">
            <th style="text-align:left;padding:8px 12px;font-size:12px;color:#64748b;font-weight:600;border-bottom:1px solid #e2e8f0;">Item</th>
            <th style="text-align:center;padding:8px 12px;font-size:12px;color:#64748b;font-weight:600;border-bottom:1px solid #e2e8f0;">Qty</th>
            <th style="text-align:right;padding:8px 12px;font-size:12px;color:#64748b;font-weight:600;border-bottom:1px solid #e2e8f0;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(i => `
            <tr>
              <td style="padding:8px 12px;font-size:13px;color:#1e293b;border-bottom:1px solid #f1f5f9;">${i.name}</td>
              <td style="padding:8px 12px;font-size:13px;color:#475569;text-align:center;border-bottom:1px solid #f1f5f9;">x${i.quantity || i.qty || 1}</td>
              <td style="padding:8px 12px;font-size:13px;color:#1e293b;text-align:right;border-bottom:1px solid #f1f5f9;">₹${i.price}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      <div style="text-align:right;font-size:15px;font-weight:700;color:#1e293b;padding:8px 12px;border-top:2px solid #e2e8f0;">
        Total: <span style="color:${config.color}">₹${total}</span>
      </div>
    `
    : "";

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 0;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:${config.color};padding:32px 40px;text-align:center;">
            <div style="font-size:48px;margin-bottom:12px;">${config.emoji}</div>
            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.3px;">${config.heading}</h1>
          </td>
        </tr>

        <!-- Brand bar -->
        <tr>
          <td style="background:#0f172a;padding:12px 40px;text-align:center;">
            <span style="color:#ffffff;font-size:18px;font-weight:800;letter-spacing:1px;">🍴 EATOZ</span>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px 40px;">
            <p style="margin:0 0 8px;font-size:15px;color:#475569;">Hello, <strong style="color:#1e293b;">${toName || "there"}</strong>!</p>
            <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6;">${config.message}</p>

            <!-- Status badge -->
            <div style="text-align:center;margin:24px 0;">
              <span style="display:inline-block;background:${config.color}18;border:2px solid ${config.color}40;color:${config.color};font-size:14px;font-weight:700;padding:10px 28px;border-radius:50px;letter-spacing:0.5px;">
                ${config.emoji} ${status}
              </span>
            </div>

            <!-- Order ID -->
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px 20px;margin:20px 0;">
              <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;margin-bottom:4px;">Order ID</div>
              <div style="font-size:14px;font-weight:700;color:#1e293b;font-family:monospace;">#${String(orderId).slice(-8).toUpperCase()}</div>
            </div>

            ${itemsHtml}

            <!-- Progress bar -->
            ${["Placed","Preparing","On the Way","Delivered"].includes(status) ? `
            <div style="margin:28px 0 8px;">
              <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;margin-bottom:12px;">Order Progress</div>
              <div style="display:flex;align-items:center;justify-content:space-between;">
                ${["Placed","Preparing","On the Way","Delivered"].map((s, i, arr) => {
                  const currentIdx = arr.indexOf(status);
                  const isDone = i <= currentIdx;
                  const isActive = s === status;
                  return `
                    <div style="text-align:center;flex:1;">
                      <div style="width:28px;height:28px;border-radius:50%;background:${isDone ? config.color : "#e2e8f0"};margin:0 auto 4px;display:flex;align-items:center;justify-content:center;font-size:12px;color:${isDone ? "#fff" : "#94a3b8"};font-weight:700;">${isDone ? "✓" : i + 1}</div>
                      <div style="font-size:9px;color:${isActive ? config.color : isDone ? "#475569" : "#94a3b8"};font-weight:${isActive ? "700" : "400"};white-space:nowrap;">${s}</div>
                    </div>
                    ${i < arr.length - 1 ? `<div style="flex:1;height:2px;background:${i < currentIdx ? config.color : "#e2e8f0"};margin-bottom:16px;"></div>` : ""}
                  `;
                }).join("")}
              </div>
            </div>` : ""}

            <p style="margin:28px 0 0;font-size:13px;color:#94a3b8;line-height:1.6;">
              If you have any questions about your order, feel free to reply to this email or contact our support team.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#94a3b8;">© 2024 Eatoz. All rights reserved.</p>
            <p style="margin:6px 0 0;font-size:12px;color:#94a3b8;">This is an automated notification — please do not reply directly.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
  `;

  await transporter.sendMail({
    from: `"Eatoz 🍴" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: config.subject,
    html,
  });

  console.log(`📧 Status email sent to ${toEmail} → ${status}`);
};

module.exports = { sendOrderStatusEmail };