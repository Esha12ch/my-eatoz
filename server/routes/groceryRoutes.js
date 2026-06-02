const express = require("express");
const router = express.Router();

const Grocery = require("../models/Grocery");

router.get("/", async (req, res) => {

  try {

    const grocery = await Grocery.find();

    res.json(grocery);

  } catch (error) {

    res.status(500).json({ message: "Server error" });

  }

});

module.exports = router;