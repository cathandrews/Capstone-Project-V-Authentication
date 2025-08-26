/**
 * Division-Specific Routes: Handles fetching and adding credentials for a division.
 * Access is controlled by JWT and user’s assigned divisions.
 */
const express = require("express");
const router = express.Router();
const Credential = require("../models/Credential");
const Division = require("../models/Division");
const auth = require("../middleware/auth");

/**
 * Get all credentials for a division.
 * Access: Only users with access to the division can view.
 */
router.get("/:divisionId/credentials", auth, async (req, res) => {
  try {
    const division = await Division.findById(req.params.divisionId);
    if (!division) {
      return res.status(404).json({ error: "Division not found" });
    }
    if (!req.user.divisions.includes(division._id.toString())) {
      return res.status(403).json({ error: "Access denied" });
    }
    const credentials = await Credential.find({ division: division._id });
    res.json(credentials);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch division credentials" });
  }
});

/**
 * Add a credential to a division.
 * Access: Only users with access to the division can add.
 */
router.post("/:divisionId/credentials", auth, async (req, res) => {
  try {
    const division = await Division.findById(req.params.divisionId);
    if (!division) {
      return res.status(404).json({ error: "Division not found" });
    }
    if (!req.user.divisions.includes(division._id.toString())) {
      return res.status(403).json({ error: "Access denied" });
    }
    const { title, username, password, url } = req.body;
    if (!title || !username || !password || !url) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const credential = new Credential({
      title,
      username,
      password,
      url,
      division: division._id,
    });
    await credential.save();
    res.status(201).json(credential);
  } catch (err) {
    res.status(500).json({ error: "Failed to add credential" });
  }
});

module.exports = router;
