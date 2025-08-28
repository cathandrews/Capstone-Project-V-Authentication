/**
 * Credential Management Routes: Handles fetching, adding, and updating credentials.
 * Access is controlled by JWT and user permissions.
 */
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Credential = require("../models/Credential");
const auth = require("../middleware/auth");

/**
 * Fetch all credentials for a division.
 * Access: All users can view credentials for their assigned divisions.
 */
router.get("/divisions/:divisionId/credentials", auth, async (req, res) => {
  try {
    const division = await mongoose
      .model("Division")
      .findById(req.params.divisionId);
    if (!division) {
      return res.status(404).json({ error: "Division not found" });
    }

    // Check if the user is assigned to the division or is an admin
    if (
      req.user.role !== "admin" &&
      !req.user.divisions.includes(req.params.divisionId)
    ) {
      return res.status(403).json({
        error: "Access denied: You are not assigned to this division.",
      });
    }

    // Fetch credentials for the division
    const credentials = await Credential.find(
      { division: req.params.divisionId },
      "_id title username url"
    );
    res.json(credentials);
  } catch (err) {
    console.error("Failed to fetch credentials:", err);
    res.status(500).json({ error: "Failed to fetch credentials" });
  }
});

/**
 * Add a new credential to a division.
 * Access: All users can add credentials to their assigned divisions.
 */
router.post("/divisions/:divisionId/credentials", auth, async (req, res) => {
  try {
    const division = await mongoose
      .model("Division")
      .findById(req.params.divisionId);
    if (!division) {
      return res.status(404).json({ error: "Division not found" });
    }

    // Check if the user is assigned to the division or is an admin
    if (
      req.user.role !== "admin" &&
      !req.user.divisions.includes(req.params.divisionId)
    ) {
      return res.status(403).json({
        error: "Access denied: You are not assigned to this division.",
      });
    }

    // Validate required fields
    const { title, username, password, url } = req.body;
    if (!title || !username || !password || !url) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Create and save the new credential
    const credential = new Credential({
      title,
      username,
      password,
      url,
      division: req.params.divisionId,
    });
    await credential.save();
    res.status(201).json(credential);
  } catch (err) {
    console.error("Failed to add credential:", err);
    res.status(500).json({ error: "Failed to add credential" });
  }
});

/**
 * Update a credential.
 * Access: Admins or management users in the credential's OU.
 */
router.put("/:credentialId", auth, async (req, res) => {
  try {
    const credential = await Credential.findById(req.params.credentialId);
    if (!credential) {
      return res.status(404).json({ error: "Credential not found" });
    }

    // Check if the user is an admin or management in the credential's OU
    if (req.user.role === "normal") {
      return res.status(403).json({
        error: "Access denied: Insufficient permissions to update credentials.",
      });
    }

    if (req.user.role === "management") {
      const division = await mongoose
        .model("Division")
        .findById(credential.division);
      const userOUIds = Array.isArray(req.user.OUs) ? req.user.OUs : [];
      if (!userOUIds.includes(division.OU.toString())) {
        return res.status(403).json({
          error: "Access denied: Credential not in your OU.",
        });
      }
    }

    // Validate required fields
    const { title, username, password, url } = req.body;
    if (!title || !username || !password || !url) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Update the credential
    credential.title = title;
    credential.username = username;
    credential.password = password;
    credential.url = url;
    await credential.save();
    res.json(credential);
  } catch (err) {
    console.error("Failed to update credential:", err);
    res.status(500).json({ error: "Failed to update credential" });
  }
});

module.exports = router;
