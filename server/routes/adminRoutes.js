const express = require("express");
const router  = express.Router();
const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");
const axios   = require("axios");

const adminMiddleware = require("../middlewares/admin");

const User       = require("../models/User");
const Food       = require("../models/Food");
const Grocery    = require("../models/Grocery");
const Restaurant = require("../models/Restaurant");
const Order      = require("../models/Order");

const { setStoreOpen, updateOrderStatus } = require("../controllers/Ordercontroller");
const { sendWelcomeEmail, sendAdminSignInAlert } = require("../utils/sendOtp");

const N8N_WEBHOOK_URL = "http://localhost:5678/webhook/cc443b88-3225-48ab-8016-ea30aa98a61f";

// ── Stats ───────────────────────────────────────────────────────
router.get("/stats", adminMiddleware, async (req, res) => {
  try {
    const totalUsers       = await User.countDocuments({ role: "user" });
    const activeUsers      = await User.countDocuments({ role: "user", isActive: true });
    const bannedUsers      = await User.countDocuments({ role: "user", isActive: false });
    const totalOrders      = await Order.countDocuments();
    const totalFood        = await Food.countDocuments();
    const totalGrocery     = await Grocery.countDocuments();
    const totalRestaurants = await Restaurant.countDocuments();

    const revenueResult = await Order.aggregate([
      { $match: { paymentMethod: "Razorpay" } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    const paymentBreakdown = await Order.aggregate([
      { $group: { _id: "$paymentMethod", count: { $sum: 1 }, amount: { $sum: "$total" } } },
    ]);

    const statusBreakdown = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // ✅ FIXED: changed from 7 days to 90 days to show all orders
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    const dailyOrders = await Order.aggregate([
      { $match: { createdAt: { $gte: ninetyDaysAgo } } },
      { $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
          revenue: { $sum: "$total" }
      }},
      { $sort: { _id: 1 } },
    ]);

    const newUsers = await User.aggregate([
      { $match: { createdAt: { $gte: ninetyDaysAgo }, role: "user" } },
      { $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
      }},
      { $sort: { _id: 1 } },
    ]);

    res.json({
      totalUsers, activeUsers, bannedUsers,
      totalOrders, totalRevenue,
      totalFood, totalGrocery, totalRestaurants,
      paymentBreakdown, statusBreakdown,
      dailyOrders, newUsers,
    });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

// ── Survey ──────────────────────────────────────────────────────
router.get("/survey", adminMiddleware, async (req, res) => {
  try {
    const topFoods = await Order.aggregate([
      { $unwind: "$items" },
      { $match: { "items.cuisine": { $exists: true, $ne: null } } },
      { $group: { _id: "$items.name", count: { $sum: "$items.quantity" }, cuisine: { $first: "$items.cuisine" } } },
      { $sort: { count: -1 } }, { $limit: 10 },
    ]);

    const topCuisines = await Order.aggregate([
      { $unwind: "$items" },
      { $match: { "items.cuisine": { $exists: true, $ne: null } } },
      { $group: { _id: "$items.cuisine", count: { $sum: "$items.quantity" } } },
      { $sort: { count: -1 } }, { $limit: 8 },
    ]);

    const topGroceries = await Order.aggregate([
      { $unwind: "$items" },
      { $match: { "items.cuisine": { $exists: false } } },
      { $group: { _id: "$items.name", count: { $sum: "$items.quantity" } } },
      { $sort: { count: -1 } }, { $limit: 10 },
    ]);

    const restaurantNames = await Restaurant.find().select("name");
    const restaurantStats = [];
    for (const r of restaurantNames) {
      const count = await Order.aggregate([
        { $unwind: "$items" },
        { $match: { "items.name": { $regex: r.name, $options: "i" } } },
        { $group: { _id: null, count: { $sum: "$items.quantity" } } },
      ]);
      restaurantStats.push({ name: r.name, count: count[0]?.count || 0 });
    }
    restaurantStats.sort((a, b) => b.count - a.count);

    const paymentPreference = await Order.aggregate([
      { $group: { _id: "$paymentMethod", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const avgOrderValue = await Order.aggregate([
      { $group: { _id: null, avg: { $avg: "$total" } } },
    ]);

    res.json({
      topFoods, topCuisines, topGroceries,
      restaurantStats: restaurantStats.slice(0, 8),
      paymentPreference,
      avgOrderValue: avgOrderValue[0]?.avg || 0,
    });
  } catch (err) {
    console.error("Survey error:", err);
    res.status(500).json({ message: "Failed to fetch survey data" });
  }
});

// ── Store Status ────────────────────────────────────────────────
let storeStatus = { isOpen: true, message: "Store is open" };

router.get("/store-status", async (req, res) => {
  res.json(storeStatus);
});

router.put("/store-status", adminMiddleware, (req, res) => {
  const { isOpen, message } = req.body;
  storeStatus = {
    isOpen,
    message: message || (isOpen ? "Store is open" : "Store is temporarily closed"),
  };
  setStoreOpen(isOpen);
  res.json({ success: true, storeStatus });
});

// ── Users ───────────────────────────────────────────────────────
router.get("/users", adminMiddleware, async (req, res) => {
  try {
    const users = await User.find({ role: "user" })
      .select("-password")
      .sort({ createdAt: -1 });

    const usersWithCount = await Promise.all(users.map(async (u) => {
      const orderCount = await Order.countDocuments({ userId: u._id });
      const totalSpent = await Order.aggregate([
        { $match: { userId: u._id, paymentMethod: "Razorpay" } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]);
      return { ...u.toObject(), orderCount, totalSpent: totalSpent[0]?.total || 0 };
    }));

    res.json(usersWithCount);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// ── n8n Internal Route (no auth needed) ─────────────────────────
router.get("/n8n/users-list", async (req, res) => {
  try {
    const users = await User.find({ role: "user", isActive: true })
      .select("name email")
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

router.delete("/user/:id", adminMiddleware, async (req, res) => {
  if (!req.params.id || req.params.id === "undefined") {
    return res.status(400).json({ message: "Invalid user ID" });
  }
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
});

router.put("/user/:id/toggle-ban", adminMiddleware, async (req, res) => {
  try {
    if (!req.params.id || req.params.id === "undefined") {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: user.isActive ? "User unbanned" : "User banned", isActive: user.isActive });
  } catch (err) {
    res.status(500).json({ message: "Failed to toggle ban" });
  }
});

// ── Orders ──────────────────────────────────────────────────────
router.get("/orders", adminMiddleware, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email phone")
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

router.put("/order/:id/status", adminMiddleware, async (req, res) => {
  try {
    if (!req.params.id || req.params.id === "undefined") {
      return res.status(400).json({ message: "Invalid order ID" });
    }
    const { status } = req.body;
    const order = await updateOrderStatus(req.params.id, status);
    res.json({ message: "Status updated", order });
  } catch (err) {
    console.error("Order status update error:", err);
    res.status(500).json({ message: "Failed to update status" });
  }
});

// ── Food ────────────────────────────────────────────────────────
router.get("/food", adminMiddleware, async (req, res) => {
  const foods = await Food.find().sort({ createdAt: -1 });
  res.json(foods);
});

router.post("/add-food", adminMiddleware, async (req, res) => {
  const { name, cuisine, image, brand, rating, price } = req.body;
  const food = await Food.create({ name, cuisine, image, brand, rating, price });

  axios.post(N8N_WEBHOOK_URL, {
    type: "new_food",
    name: food.name,
    brand: food.brand,
    image: food.image,
    price: food.price,
    cuisine: food.cuisine,
    offer: "20% OFF on your first order today!"
  }).catch(err => console.log("n8n trigger failed:", err.message));

  res.json({ message: "Food added", food });
});

router.put("/update-food/:id", adminMiddleware, async (req, res) => {
  const food = await Food.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ message: "Food updated", food });
});

router.delete("/delete-food/:id", adminMiddleware, async (req, res) => {
  await Food.findByIdAndDelete(req.params.id);
  res.json({ message: "Food deleted" });
});

// ── Grocery ─────────────────────────────────────────────────────
router.get("/grocery", adminMiddleware, async (req, res) => {
  const groceries = await Grocery.find().sort({ createdAt: -1 });
  res.json(groceries);
});

router.post("/add-grocery", adminMiddleware, async (req, res) => {
  const { name, price, image } = req.body;
  const grocery = await Grocery.create({ name, price, image });
  res.json({ message: "Grocery added", grocery });
});

router.put("/update-grocery/:id", adminMiddleware, async (req, res) => {
  const grocery = await Grocery.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ message: "Grocery updated", grocery });
});

router.delete("/delete-grocery/:id", adminMiddleware, async (req, res) => {
  await Grocery.findByIdAndDelete(req.params.id);
  res.json({ message: "Grocery deleted" });
});

// ── Restaurants ─────────────────────────────────────────────────
router.get("/restaurant", adminMiddleware, async (req, res) => {
  const restaurants = await Restaurant.find().sort({ createdAt: -1 });
  res.json(restaurants);
});

router.post("/add-restaurant", adminMiddleware, async (req, res) => {
  const { name, cuisine, location, priceForTwo, rating, image } = req.body;
  const restaurant = await Restaurant.create({ name, cuisine, location, priceForTwo, rating, image });

  axios.post(N8N_WEBHOOK_URL, {
    type: "new_restaurant",
    name: restaurant.name,
    cuisine: restaurant.cuisine,
    image: restaurant.image,
    location: restaurant.location,
    priceForTwo: restaurant.priceForTwo,
    offer: "Free delivery on your first order!"
  }).catch(err => console.log("n8n trigger failed:", err.message));

  res.json({ message: "Restaurant added", restaurant });
});

router.put("/update-restaurant/:id", adminMiddleware, async (req, res) => {
  const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ message: "Restaurant updated", restaurant });
});

router.delete("/delete-restaurant/:id", adminMiddleware, async (req, res) => {
  await Restaurant.findByIdAndDelete(req.params.id);
  res.json({ message: "Restaurant deleted" });
});

// ── Admin Login ─────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    const admin = await User.findOne({ email, role: "admin" });
    if (!admin) return res.status(401).json({ message: "No admin account found with this email" });

    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign(
      { userId: admin._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    sendWelcomeEmail(admin.email, admin.name).catch(err =>
      console.error("Admin welcome email failed:", err)
    );

    sendAdminSignInAlert(admin.name, admin.email, "admin").catch(err =>
      console.error("Admin self-alert email failed:", err)
    );

    res.json({
      token,
      admin: { _id: admin._id, name: admin.name, email: admin.email, role: admin.role },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;