const express = require("express");
const router  = express.Router();
const User    = require("../models/User");

// ── GET user by ID ──────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    // ✅ FIXED: guard against undefined id
    const { id } = req.params;
    if (!id || id === "undefined" || id === "null") {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    const user = await User.findById(id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

// ── UPDATE user profile ─────────────────────────────────────────
router.put("/:id", async (req, res) => {
  try {
    // ✅ FIXED: guard against undefined id
    const { id } = req.params;
    if (!id || id === "undefined" || id === "null") {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    const { name, email, phone, profileName } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required." });
    }

    const existing = await User.findOne({ email, _id: { $ne: id } });
    if (existing) {
      return res.status(400).json({ message: "Email already in use by another account." });
    }

    const updated = await User.findByIdAndUpdate(
      id,
      { name, email, phone, profileName },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updated) return res.status(404).json({ message: "User not found." });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while updating profile." });
  }
});

module.exports = router;