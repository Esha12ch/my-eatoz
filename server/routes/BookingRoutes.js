const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");

// ✅ POST — create a new booking
router.post("/", async (req, res) => {
  try {
    const { userId, restaurant, restaurantImage, date, time, seats } = req.body;

    if (!userId || !restaurant || !date || !time || !seats) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const booking = await Booking.create({
      userId,
      restaurant,
      restaurantImage: restaurantImage || "",
      date,
      time,
      seats,
    });

    res.status(201).json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ message: "Booking failed", error: err.message });
  }
});

// ✅ GET — all bookings for admin dashboard
router.get("/", async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("userId", "name email phone")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ GET — bookings for a specific user (user dashboard)
router.get("/user/:userId", async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.params.userId }).sort({
      createdAt: -1,
    });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ PATCH — cancel a booking
router.patch("/:id/cancel", async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: "Cancelled" },
      { new: true }
    );
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;