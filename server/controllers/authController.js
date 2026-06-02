const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendOtpEmail, sendWelcomeEmail } = require("../utils/sendOtp");

const JWT_SECRET = process.env.JWT_SECRET;

const otpStore = {};

/* ─── SIGNUP ─────────────────────────────────────────────── */
const signup = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone: phone || null,
    });

    // ✅ role included in token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        profileName: user.profileName || "",
        role: user.role,
      },
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─── LOGIN STEP 1: Verify credentials → Send OTP ───────── */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "User not found" });

    // ✅ Check if account is active (admin may have banned)
    if (!user.isActive)
      return res.status(403).json({ message: "Your account has been suspended. Contact support." });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ message: "Invalid password" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    otpStore[email] = { otp, expiresAt, userName: user.name };

    await sendOtpEmail(email, otp, user.name);

    res.json({ message: "OTP sent to your email", otpSent: true });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ─── LOGIN STEP 2: Verify OTP → Issue token ────────────── */
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const record = otpStore[email];

    if (!record)
      return res.status(400).json({ message: "OTP not found. Please login again." });

    if (Date.now() > record.expiresAt) {
      delete otpStore[email];
      return res.status(400).json({ message: "OTP expired. Please login again." });
    }

    if (record.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP. Try again." });

    delete otpStore[email];

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "User not found." });

    // ✅ Update last login
    user.lastLogin = new Date();
    await user.save();

    // ✅ role included in token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    sendWelcomeEmail(email, user.name).catch(err =>
      console.error("Welcome email failed:", err)
    );

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        profileName: user.profileName || "",
        role: user.role,
      },
    });

  } catch (err) {
    console.error("OTP verify error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ─── PROFILE ────────────────────────────────────────────── */
const profile = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");
    res.json(user);
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = { signup, login, verifyOtp, profile };