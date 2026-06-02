const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema({
  name: String,
  image: String,
  rating: String,
  cuisine: String,
  priceForTwo: Number,
  location: String
});

module.exports = mongoose.model("Restaurant", restaurantSchema);