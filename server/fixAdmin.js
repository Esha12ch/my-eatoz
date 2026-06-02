require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const ADMIN_EMAIL    = "eshachauhan1204@gmail.com";
const ADMIN_PASSWORD = "Esha1204";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: "user" },
}, { strict: false });

const User = mongoose.models.User || mongoose.model("User", userSchema);

async function fixAdmin() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  console.log("✅ Connected to DB:", mongoose.connection.db.databaseName);
  // Should print: eatoz

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  console.log("🔍 Existing user:", existing ? `Found — role: ${existing.role}` : "❌ Not found");

  const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const result = await User.findOneAndUpdate(
    { email: ADMIN_EMAIL },
    { 
      $set: { 
        name: "Admin",
        email: ADMIN_EMAIL,
        role: "admin", 
        password: hashed 
      } 
    },
    { new: true, upsert: true }
  );

  console.log("✅ Admin ready:", result.email, "| role:", result.role);

  await mongoose.disconnect();
  process.exit(0);
}

fixAdmin();