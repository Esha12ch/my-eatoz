const Order = require("../models/Order");
const User  = require("../models/User");
const { sendOrderStatusEmail } = require("./Mailer");

// ── Shared store state ──────────────────────────────────────────
const storeState = { isOpen: true };
const setStoreOpen  = (isOpen) => { storeState.isOpen = isOpen; };
const getStoreOpen  = () => storeState.isOpen;

// ── Auto-progression pipeline ───────────────────────────────────
const STATUS_PIPELINE    = ["Placed", "Preparing", "On the Way", "Delivered"];
const TERMINAL_STATUSES  = ["Delivered", "Cancelled"];
const AUTO_INTERVAL_MS   = 60 * 1000;

const activeTimers = {};

// ── Email helper ────────────────────────────────────────────────
const notifyUser = async (order, status) => {
  try {
    let email = order.userEmail;
    let name  = order.userName;

    // ✅ FIXED: guard against undefined userId before DB call
    if (!email && order.userId) {
      const user = await User.findById(order.userId).select("email name");
      if (user) { email = user.email; name = user.name; }
    }

    if (!email) return;

    await sendOrderStatusEmail({
      toEmail: email,
      toName:  name || "Customer",
      orderId: order._id,
      status,
      items:   order.items || [],
      total:   order.total,
    });
  } catch (err) {
    console.error("Email send error:", err.message);
  }
};

// ── Auto-progression scheduler ──────────────────────────────────
const scheduleNextStatus = (orderId, currentStatus) => {
  if (activeTimers[orderId]) {
    clearTimeout(activeTimers[orderId]);
    delete activeTimers[orderId];
  }

  if (TERMINAL_STATUSES.includes(currentStatus)) return;

  const currentIdx = STATUS_PIPELINE.indexOf(currentStatus);
  if (currentIdx === -1 || currentIdx >= STATUS_PIPELINE.length - 1) return;

  const nextStatus = STATUS_PIPELINE[currentIdx + 1];

  activeTimers[orderId] = setTimeout(async () => {
    try {
      const order = await Order.findById(orderId);
      if (!order || TERMINAL_STATUSES.includes(order.status)) {
        delete activeTimers[orderId];
        return;
      }

      order.status = nextStatus;
      await order.save();

      console.log(`⏱ Auto-advanced order ${orderId}: ${currentStatus} → ${nextStatus}`);

      await notifyUser(order, nextStatus);

      delete activeTimers[orderId];

      if (!TERMINAL_STATUSES.includes(nextStatus)) {
        scheduleNextStatus(orderId, nextStatus);
      }
    } catch (err) {
      console.error("Auto-status error:", err.message);
      delete activeTimers[orderId];
    }
  }, AUTO_INTERVAL_MS);
};

// ── Resume timers on server restart ────────────────────────────
const resumeActiveOrders = async () => {
  try {
    const activeOrders = await Order.find({ status: { $nin: TERMINAL_STATUSES } });
    console.log(`🔄 Resuming auto-progression for ${activeOrders.length} active orders...`);
    activeOrders.forEach((order) => {
      scheduleNextStatus(String(order._id), order.status);
    });
  } catch (err) {
    console.error("Resume orders error:", err.message);
  }
};

resumeActiveOrders();

// ── Save order ──────────────────────────────────────────────────
const saveOrder = async ({ userId, items, total, paymentMethod, razorpayOrderId, razorpayPaymentId }) => {

  // ✅ FIXED: validate userId before doing anything with it
  if (!userId || userId === "undefined" || userId === "null") {
    throw new Error("Invalid userId — cannot place order without a logged-in user.");
  }

  const order = new Order({
    userId,
    items: items.map(item => ({
      name:     item.name,
      quantity: item.qty,
      price:    item.price,
      image:    item.image   || "",
      cuisine:  item.cuisine || "",
    })),
    total,
    paymentMethod,
    status: "Placed",
    razorpayOrderId:   razorpayOrderId  || null,
    razorpayPaymentId: razorpayPaymentId || null,
  });

  await order.save();

  // ✅ FIXED: only update user if userId is valid
  try {
    await User.findByIdAndUpdate(
      userId,
      { $push: { orderHistory: order._id } },
      { new: true }
    );
  } catch (err) {
    // Don't crash the order — just log it
    console.error("Could not update user orderHistory:", err.message);
  }

  await notifyUser(order, "Placed");
  scheduleNextStatus(String(order._id), "Placed");

  return order;
};

// ── GET /api/orders/user/:userId ────────────────────────────────
const getUserOrders = async (req, res) => {
  try {
    // ✅ FIXED: validate userId param before querying
    const { userId } = req.params;
    if (!userId || userId === "undefined" || userId === "null") {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    console.error("Failed to fetch orders:", err);
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
};

// ── POST /api/orders/save  (Wallet / Pay Later) ─────────────────
const saveManualOrder = async (req, res) => {
  try {
    if (!storeState.isOpen) {
      return res.status(503).json({
        success: false,
        message: "Store is currently closed. We are not accepting orders right now.",
      });
    }

    const { userId, items, total, paymentMethod } = req.body;

    // ✅ FIXED: validate all required fields including userId
    if (!userId || userId === "undefined" || userId === "null") {
      return res.status(400).json({ success: false, message: "User not logged in. Please sign in to place an order." });
    }

    if (!items || !total || !paymentMethod) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const order = await saveOrder({ userId, items, total, paymentMethod });

    res.status(201).json({ success: true, message: "Order saved successfully", order });
  } catch (err) {
    console.error("Failed to save order:", err);
    res.status(500).json({ success: false, message: err.message || "Failed to save order" });
  }
};

// ── PUT /api/admin/order/:id/status ────────────────────────────
const updateOrderStatus = async (orderId, newStatus) => {
  const order = await Order.findByIdAndUpdate(
    orderId,
    { status: newStatus },
    { new: true }
  );

  if (!order) throw new Error("Order not found");

  await notifyUser(order, newStatus);
  scheduleNextStatus(String(order._id), newStatus);

  return order;
};

module.exports = {
  saveOrder,
  getUserOrders,
  saveManualOrder,
  updateOrderStatus,
  setStoreOpen,
  getStoreOpen,
};