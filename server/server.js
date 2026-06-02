require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const authRoutes       = require("./routes/authRoutes");
const userRoutes       = require("./routes/users");
const foodRoutes       = require("./routes/foodRoutes");
const groceryRoutes    = require("./routes/groceryRoutes");
const restaurantRoutes = require("./routes/restaurantRoutes");
const adminRoutes      = require("./routes/adminRoutes");
const paymentRoutes    = require("./routes/paymentRoutes");
const orderRoutes      = require("./routes/orderRoutes");
const bookingRoutes    = require("./routes/BookingRoutes");

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  res.setTimeout(10000, () => {
    res.status(408).json({ message: "Request timeout" });
  });
  next();
});

app.use("/api/auth",        authRoutes);
app.use("/api/users",       userRoutes);
app.use("/api/food",        foodRoutes);
app.use("/api/grocery",     groceryRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/admin",       adminRoutes);
app.use("/api/payment",     paymentRoutes);
app.use("/api/orders",      orderRoutes);
app.use("/api/bookings",    bookingRoutes);

app.get("/", (req, res) => res.send("Server running 🚀"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));