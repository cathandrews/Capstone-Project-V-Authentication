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
 * Access: Admins see all, management sees all in their OUs, normal users see only assigned.
 */
router.get("/divisions/:divisionId/credentials", auth, async (req, res) => {
  try {
    const division = await mongoose
      .model("Division")
      .findById(req.params.divisionId);
    if (!division) {
      return res.status(404).json({ error: "Division not found" });
    }
    if (req.user.role === "admin") {
      const credentials = await Credential.find(
        { division: req.params.divisionId },
        "_id title username url"
      );
      return res.json(credentials);
    }
    if (req.user.role === "management") {
      const userOUIds = Array.isArray(req.user.OUs) ? req.user.OUs : [];
      if (!userOUIds.includes(division.OU.toString())) {
        return res
          .status(403)
          .json({ error: "Access denied: division not in your OU" });
      }
      const credentials = await Credential.find(
        { division: req.params.divisionId },
        "_id title username url"
      );
      return res.json(credentials);
    }
    if (!req.user.divisions.includes(req.params.divisionId)) {
      return res
        .status(403)
        .json({ error: "Access denied: not assigned to this division" });
    }
    const credentials = await Credential.find(
      { division: req.params.divisionId },
      "_id title username url"
    );
    res.json(credentials);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch credentials" });
  }
});

/**
 * Add a new credential to a division.
 * Access: Admins and users assigned to the division.
 */
router.post("/divisions/:divisionId/credentials", auth, async (req, res) => {
  try {
    const division = await mongoose
      .model("Division")
      .findById(req.params.divisionId);
    if (!division) {
      return res.status(404).json({ error: "Division not found" });
    }
    if (
      req.user.role !== "admin" &&
      !req.user.divisions.includes(req.params.divisionId)
    ) {
      return res
        .status(403)
        .json({ error: "Access denied: not assigned to this division" });
    }
    const { title, username, password, url } = req.body;
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
    res.status(500).json({ error: "Failed to add credential" });
  }
});

/**
 * Update a credential.
 * Access: Admins and management users in the credential's OU.
 */
router.put("/:credentialId", auth, async (req, res) => {
  try {
    const credential = await Credential.findById(req.params.credentialId);
    if (!credential) {
      return res.status(404).json({ error: "Credential not found" });
    }
    if (req.user.role === "normal") {
      return res
        .status(403)
        .json({ error: "Access denied: insufficient role" });
    }
    if (req.user.role === "management") {
      const division = await mongoose
        .model("Division")
        .findById(credential.division);
      const userOUIds = Array.isArray(req.user.OUs) ? req.user.OUs : [];
      if (!userOUIds.includes(division.OU.toString())) {
        return res
          .status(403)
          .json({ error: "Access denied: credential not in your OU" });
      }
    }
    const { title, username, password, url } = req.body;
    credential.title = title;
    credential.username = username;
    credential.password = password;
    credential.url = url;
    await credential.save();
    res.json(credential);
  } catch (err) {
    res.status(500).json({ error: "Failed to update credential" });
  }
});

module.exports = router;
