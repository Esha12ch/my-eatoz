const express = require("express");
const router = express.Router();

const Food = require("../models/Food");

/* GET ALL FOOD (Page1) */
router.get("/", async (req, res) => {
  try {
    const foods = await Food.find();
    res.json(foods);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/* 🔥 GET MENU BY BRAND */
router.get("/brand/:brandName", async (req, res) => {
  try {
    const brand = req.params.brandName;

    const foods = await Food.find({ brand: brand });

    res.json(foods);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;