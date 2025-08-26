/**
 * Authentication Routes: Handles user registration and login.
 * Generates JWTs containing user details, including role, divisions, and OUs.
 */
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * User Registration: Creates a new user and returns a JWT.
 */
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ error: "Username already exists" });
    }
    user = new User({ username, password });
    await user.save();
    const payload = {
      id: user._id,
      username: user.username,
      role: user.role,
      divisions: user.divisions,
      OUs: user.OUs,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.status(201).json({ token, role: user.role });
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
  }
});

/**
 * User Login: Authenticates a user and returns a JWT.
 */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    const payload = {
      id: user._id,
      username: user.username,
      role: user.role,
      divisions: user.divisions,
      OUs: user.OUs,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token, role: user.role });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

module.exports = router;
