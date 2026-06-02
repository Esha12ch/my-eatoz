const express = require("express");
const router  = express.Router();
const transporter = require("../utils/mailer");
const Order = require("../models/Order");

const {
  getUserOrders,
  saveManualOrder,
  updateOrderStatus,
} = require("../controllers/Ordercontroller");

// ── GET /api/orders/user/:userId ────────────────────────────────
router.get("/user/:userId", getUserOrders);

// ── POST /api/orders/save  (Wallet / Pay Later) ─────────────────
router.post("/save", saveManualOrder);

// ── PUT /api/orders/:id/status ──────────────────────────────────
router.put("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || id === "undefined")
      return res.status(400).json({ message: "Invalid order ID" });
    const { status } = req.body;
    const order = await updateOrderStatus(id, status);
    res.json({ message: "Status updated", order });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to update status" });
  }
});

// ── PUT /api/orders/:id/cancel ──────────────────────────────────
router.put("/:id/cancel", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || id === "undefined")
      return res.status(400).json({ message: "Invalid order ID" });
    const order = await updateOrderStatus(id, "Cancelled");
    res.json({ message: "Order cancelled", order });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to cancel order" });
  }
});

// ── POST /api/orders/:id/send-invoice ───────────────────────────
router.post("/:id/send-invoice", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("userId", "name email phone");
    if (!order) return res.status(404).json({ message: "Order not found" });

    const toEmail = order.userId?.email;
    if (!toEmail) return res.status(400).json({ message: "No email found for this user" });

    const subtotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
    const tax      = Math.round(subtotal * 0.05);
    const delivery = order.total - subtotal - tax > 0 ? order.total - subtotal - tax : 0;
    const orderId  = order._id.toString().slice(-8).toUpperCase();
    const date     = new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
    const time     = new Date(order.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

    const statusColors = {
      Placed: "#3b82f6", Preparing: "#f59e0b",
      "On the Way": "#8b5cf6", Delivered: "#10b981", Cancelled: "#ef4444",
    };
    const payColors = {
      Razorpay: "#6366f1", Wallet: "#10b981", "Pay Later": "#f59e0b", UPI: "#14b8a6", Card: "#ec4899",
    };
    const statusColor = statusColors[order.status] || "#6366f1";
    const payColor    = payColors[order.paymentMethod] || "#6366f1";

    const itemRows = order.items.map(i => `
      <tr>
        <td style="padding:14px 16px;border-bottom:1px solid #f0ede8;font-size:13px;color:#1a1a1a;font-weight:500">${i.name}</td>
        <td style="padding:14px 16px;border-bottom:1px solid #f0ede8;font-size:12px;color:#999">
          <span style="background:#f5f4f0;padding:3px 10px;border-radius:20px">${i.cuisine || "—"}</span>
        </td>
        <td style="padding:14px 16px;border-bottom:1px solid #f0ede8;text-align:center">
          <span style="background:#ede9fe;color:#6366f1;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:700">${i.quantity}</span>
        </td>
        <td style="padding:14px 16px;border-bottom:1px solid #f0ede8;text-align:right;font-size:13px;color:#555">₹${i.price.toLocaleString()}</td>
        <td style="padding:14px 16px;border-bottom:1px solid #f0ede8;text-align:right;font-size:13px;font-weight:700;color:#1a1a1a">₹${(i.price * i.quantity).toLocaleString()}</td>
      </tr>
    `).join("");

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
</head>
<body style="margin:0;padding:0;background:#f0efe9;font-family:Arial,sans-serif">

  <div style="max-width:640px;margin:40px auto 60px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.12)">

    <!-- ░░ MASTHEAD ░░ -->
    <div style="background:linear-gradient(135deg,#0d0d1a 0%,#1a0a2e 55%,#0d0d1a 100%);padding:44px 48px 36px">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td valign="top">
            <div style="font-size:38px;font-weight:800;color:#ffffff;letter-spacing:-1.5px;line-height:1">Eatoz</div>
            <div style="font-size:10px;color:rgba(255,255,255,0.38);letter-spacing:2.5px;text-transform:uppercase;margin-top:6px">Food &amp; Grocery Delivery</div>
          </td>
          <td valign="top" align="right">
            <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.35);margin-bottom:5px">Invoice</div>
            <div style="font-size:24px;font-weight:700;color:#ffffff;letter-spacing:-0.5px">#${orderId}</div>
            <div style="margin-top:10px;display:inline-block;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.14);border-radius:20px;padding:4px 14px">
              <span style="font-size:11px;color:rgba(255,255,255,0.55)">📅 ${date} · ${time}</span>
            </div>
          </td>
        </tr>
      </table>

      <div style="margin-top:22px;height:1px;background:rgba(255,255,255,0.08)"></div>

      <div style="margin-top:18px">
        <span style="display:inline-block;padding:5px 16px;border-radius:20px;font-size:11px;font-weight:700;
          background:${statusColor}25;border:1px solid ${statusColor}55;color:${statusColor}">
          ● ${order.status}
        </span>
        ${order.razorpayPaymentId ? `
        <span style="display:inline-block;margin-left:10px;padding:5px 14px;border-radius:20px;font-size:10px;
          background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.4)">
          🔒 ${order.razorpayPaymentId.slice(0, 18)}…
        </span>` : ""}
      </div>
    </div>

    <!-- ░░ BILLED TO + PAYMENT ░░ -->
    <div style="padding:36px 48px 28px;border-bottom:1px solid #f0ede8">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td width="50%" valign="top">
            <div style="font-size:9px;text-transform:uppercase;letter-spacing:2px;color:#bbb;font-weight:700;margin-bottom:12px">Billed To</div>
            <div style="font-size:22px;font-weight:700;color:#1a1a1a;margin-bottom:8px">${order.userId?.name || "Customer"}</div>
            ${order.userId?.email ? `
            <div style="font-size:12px;color:#888;margin-bottom:5px">
              <span style="margin-right:6px">✉</span>${order.userId.email}
            </div>` : ""}
            ${order.userId?.phone ? `
            <div style="font-size:12px;color:#888">
              <span style="margin-right:6px">📞</span>${order.userId.phone}
            </div>` : ""}
          </td>
          <td width="50%" valign="top" align="right">
            <div style="font-size:9px;text-transform:uppercase;letter-spacing:2px;color:#bbb;font-weight:700;margin-bottom:12px">Payment</div>
            <div style="font-size:18px;font-weight:700;color:${payColor};margin-bottom:10px">● ${order.paymentMethod}</div>
            <span style="display:inline-block;padding:5px 14px;border-radius:8px;font-size:11px;font-weight:700;
              background:${payColor}18;border:1px solid ${payColor}40;color:${payColor}">
              ✓ Verified &amp; Captured
            </span>
          </td>
        </tr>
      </table>
    </div>

    <!-- ░░ ORDER ITEMS ░░ -->
    <div style="padding:28px 48px 0">
      <div style="font-size:9px;text-transform:uppercase;letter-spacing:2px;color:#bbb;font-weight:700;margin-bottom:16px">Order Items</div>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
        <thead>
          <tr style="background:#faf9f7">
            <th style="padding:10px 16px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#bbb;font-weight:700;border-bottom:2px solid #f0ede8">Item</th>
            <th style="padding:10px 16px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#bbb;font-weight:700;border-bottom:2px solid #f0ede8">Cuisine</th>
            <th style="padding:10px 16px;text-align:center;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#bbb;font-weight:700;border-bottom:2px solid #f0ede8">Qty</th>
            <th style="padding:10px 16px;text-align:right;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#bbb;font-weight:700;border-bottom:2px solid #f0ede8">Unit Price</th>
            <th style="padding:10px 16px;text-align:right;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#bbb;font-weight:700;border-bottom:2px solid #f0ede8">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
      </table>
    </div>

    <!-- ░░ TOTALS ░░ -->
    <div style="padding:20px 48px 36px">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td></td>
          <td width="260">
            <div style="background:#faf9f7;border-radius:10px;padding:20px 24px;margin-top:8px">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:13px;color:#888;padding-bottom:10px">Subtotal</td>
                  <td style="font-size:13px;color:#333;text-align:right;padding-bottom:10px">₹${subtotal.toLocaleString()}</td>
                </tr>
                ${tax > 0 ? `
                <tr>
                  <td style="font-size:13px;color:#888;padding-bottom:10px">GST (5%)</td>
                  <td style="font-size:13px;color:#333;text-align:right;padding-bottom:10px">₹${tax.toLocaleString()}</td>
                </tr>` : ""}
                ${delivery > 0 ? `
                <tr>
                  <td style="font-size:13px;color:#888;padding-bottom:10px">Delivery</td>
                  <td style="font-size:13px;color:#333;text-align:right;padding-bottom:10px">₹${delivery.toLocaleString()}</td>
                </tr>` : ""}
                <tr>
                  <td colspan="2" style="padding-top:2px;padding-bottom:12px">
                    <div style="height:1px;background:#e8e4df"></div>
                  </td>
                </tr>
                <tr>
                  <td style="font-size:16px;font-weight:700;color:#1a1a1a">Total</td>
                  <td style="font-size:22px;font-weight:800;color:#6366f1;text-align:right">₹${order.total.toLocaleString()}</td>
                </tr>
              </table>
            </div>
          </td>
        </tr>
      </table>
    </div>

    <!-- ░░ FOOTER ░░ -->
    <div style="padding:24px 48px 32px;border-top:1px solid #f0ede8;background:#faf9f7">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td valign="middle">
            <div style="font-size:20px;font-weight:800;color:#1a1a1a;letter-spacing:-0.5px">Eatoz</div>
            <div style="font-size:12px;color:#bbb;margin-top:3px">Thank you for your order 🍴</div>
          </td>
          <td valign="middle" align="right">
            <div style="font-size:11px;color:#ccc;line-height:1.7;text-align:right">
              Computer-generated invoice · No signature required<br/>
              <span style="opacity:0.6">Generated ${new Date().toLocaleDateString("en-IN")}</span>
            </div>
          </td>
        </tr>
      </table>
    </div>

  </div>

  <!-- ░░ EMAIL FOOTER ░░ -->
  <div style="text-align:center;padding-bottom:40px">
    <p style="font-size:11px;color:#aaa;margin:0">
      This is an automated email from Eatoz. Please do not reply.
    </p>
  </div>

</body>
</html>`;

    await transporter.sendMail({
      from: `"Eatoz" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `Your Eatoz Invoice #${orderId}`,
      html,
    });

    res.json({ message: `Invoice sent to ${toEmail}` });
  } catch (err) {
    console.error("Send invoice error:", err);
    res.status(500).json({ message: err.message || "Failed to send email" });
  }
});

module.exports = router;