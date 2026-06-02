const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema({
  name: String,
  cuisine: String,
  rating: String,
  image: String,
  brand: String,
  price: Number, // ✅ ADDED
});

module.exports = mongoose.model("Food", foodSchema);