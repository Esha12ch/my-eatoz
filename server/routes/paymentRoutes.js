const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const Razorpay = require("razorpay");
const { saveOrder, getStoreOpen } = require("../controllers/Ordercontroller"); // ✅ getStoreOpen added

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /api/payment/create-order
// ✅ Guard here too — block Razorpay order creation when store is closed
router.post("/create-order", async (req, res) => {
  try {
    if (!getStoreOpen()) {
      return res.status(503).json({
        success: false,
        message: "Store is currently closed. We are not accepting orders right now.",
      });
    }

    const { amount } = req.body;
    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);
    res.json({ orderId: order.id, currency: order.currency, amount: order.amount });
  } catch (err) {
    console.error("Razorpay create-order error:", err);
    res.status(500).json({ message: "Failed to create Razorpay order" });
  }
});

// POST /api/payment/verify
router.post("/verify", async (req, res) => {
  try {
    // ✅ Double-check store is still open at time of verification
    if (!getStoreOpen()) {
      return res.status(503).json({
        success: false,
        message: "Store is currently closed. Your payment will be refunded if charged.",
      });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      items,
      total,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }

    const order = await saveOrder({
      userId,
      items,
      total,
      paymentMethod: "Razorpay",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    });

    res.json({ success: true, message: "Payment verified and order saved", order });
  } catch (err) {
    console.error("Razorpay verify error:", err);
    res.status(500).json({ success: false, message: "Verification error" });
  }
});

module.exports = router;