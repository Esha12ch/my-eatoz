const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  items: [
    {
      name: String,
      quantity: Number,
      price: Number,
      image: String,      // ✅ storing item image too
      cuisine: String,    // ✅ storing cuisine type
    }
  ],

  total: { type: Number, required: true },

  paymentMethod: {
    type: String,
    enum: ["Razorpay", "Wallet", "Pay Later", "UPI", "Card"],
    default: "Razorpay"
  },

  status: {
    type: String,
    enum: ["Placed", "Preparing", "On the Way", "Delivered", "Cancelled"],
    default: "Placed"
  },

  // ✅ Razorpay payment reference (only for online payments)
  razorpayOrderId: { type: String, default: null },
  razorpayPaymentId: { type: String, default: null },

}, { timestamps: true }); // ✅ uses mongoose timestamps (createdAt, updatedAt)

module.exports = mongoose.model("Order", OrderSchema);