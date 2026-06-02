const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    default: null,
    sparse: true,
    unique: true,
  },
  profileName: {
    type: String,
    default: "",
  },

  // ✅ Role-based access
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },

  // ✅ Account status (admin can ban users)
  isActive: {
    type: Boolean,
    default: true,
  },

  // ✅ Track last login
  lastLogin: {
    type: Date,
    default: null,
  },

  // ✅ stores references to all orders placed by this user
  orderHistory: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
  ],

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);