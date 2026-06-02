const mongoose = require("mongoose");

const grocerySchema = new mongoose.Schema({
  name: String,
  price: Number,
  image: String
});

module.exports = mongoose.model("Grocery", grocerySchema);