/**
 * Authentication Routes: Handles user registration and login.
 * Generates JWTs containing user details, including role, divisions, and OUs.
 */
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); // Add this line
const User = require("../models/User");

/**
 * User Registration: Creates a new user and returns a JWT.
 * Allows assignment to multiple OUs and divisions. New users are always registered as "normal".
 */
router.post("/register", async (req, res) => {
  try {
    const { username, password, ouIds = [], divisionIds = [] } = req.body;
    console.log("Registration request body:", req.body);

    // Check if the user already exists
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ error: "Username already exists" });
    }

    // Validate that at least one OU and division is provided
    if (!ouIds || ouIds.length === 0) {
      return res
        .status(400)
        .json({ error: "At least one OU is required for registration" });
    }
    if (!divisionIds || divisionIds.length === 0) {
      return res
        .status(400)
        .json({ error: "At least one division is required for registration" });
    }

    // Convert IDs to ObjectId format
    const ouObjectIds = ouIds.map((id) => new mongoose.Types.ObjectId(id));
    const divisionObjectIds = divisionIds.map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    // Create the new user with the default role "normal"
    user = new User({
      username,
      password,
      role: "normal",
      OUs: ouObjectIds,
      divisions: divisionObjectIds,
    });

    // Save the user to the database
    await user.save();

    // Create a JWT payload with user details
    const payload = {
      id: user._id,
      username: user.username,
      role: user.role,
      divisions: user.divisions,
      OUs: user.OUs,
    };

    // Generate a JWT token
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Return the token and user role
    res.status(201).json({ token, role: user.role });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

/**
 * User Login: Authenticates a user and returns a JWT.
 */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log("Login attempt for username:", username);

    // Find the user by username
    const user = await User.findOne({ username });
    if (!user) {
      console.log("User not found in database");
      return res.status(400).json({ error: "Invalid credentials" });
    }
    console.log("User found:", user.username);
    console.log("Stored hashed password:", user.password);

    // Compare the provided password with the stored hash using bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match result:", isMatch);

    if (!isMatch) {
      console.log("Password does not match");
      return res.status(400).json({ error: "Invalid credentials" });
    }
    console.log("Password matches");

    // Create a JWT payload with user details
    const payload = {
      id: user._id,
      username: user.username,
      role: user.role,
      divisions: user.divisions,
      OUs: user.OUs,
    };

    // Generate a JWT token
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Return the token and user role
    res.json({ token, role: user.role });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

module.exports = router;
