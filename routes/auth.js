const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const streamifier = require("streamifier");
const cloudinary = require("../config/cloudinary");
const User = require("../models/User");

const router = express.Router();

// ✅ Define storage FIRST
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Registration route
router.post("/register", upload.single("image"), async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log("📝 Registration attempt for:", email);
    console.log("File received:", req.file ? "Yes" : "No");

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Check if image was uploaded
    if (!req.file) {
      return res.status(400).json({ error: "Profile image is required" });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    console.log("☁️ Uploading to Cloudinary...");

    // Convert buffer to base64 and upload to Cloudinary
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = "data:" + req.file.mimetype + ";base64," + b64;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "sticky_Profiles",
      resource_type: "auto",
    });

    console.log("✅ Upload successful:", result.secure_url);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashed,
      profileImage: result.secure_url,
    });

    console.log("✅ User created:", user.email);

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Send response
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("❌ Registration error:", error);
    res.status(500).json({
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("🔐 Login attempt for:", email);

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ User not found");
      return res.status(400).json({ error: "Invalid credentials" });
    }

    console.log("✅ User found");

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ Password mismatch");
      return res.status(400).json({ error: "Invalid credentials" });
    }

    console.log("✅ Password matched");

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    console.log("✅ Login successful");

    // Send response
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;