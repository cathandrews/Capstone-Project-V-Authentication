/**
 * User Management Routes: Handles fetching users, divisions, and OUs.
 * Access is controlled by JWT and user permissions.
 */
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/User");
const Division = require("../models/Division");
const OU = require("../models/OU");
const auth = require("../middleware/auth");
const authorizeRoles = require("../middleware/authorizeRoles");

/**
 * Fetch all users.
 * Access: Admin only.
 */
router.get("/", auth, authorizeRoles("admin"), async (req, res) => {
  try {
    const users = await User.find({}, "_id username role OUs divisions");
    res.json(users);
  } catch (err) {
    console.error("Failed to fetch users:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

/**
 * Public: Fetch all OUs for registration.
 * Access: No auth required.
 */
router.get("/ous/public", async (req, res) => {
  try {
    const ous = await OU.find({}, "_id name");
    res.json(ous);
  } catch (err) {
    console.error("Failed to fetch OUs (public):", err);
    res.status(500).json({ error: "Failed to fetch OUs" });
  }
});

/**
 * Fetch all OUs.
 * Access: Authenticated users.
 */
router.get("/ous/all", auth, async (req, res) => {
  try {
    const ous = await OU.find({}, "_id name");
    res.json(ous);
  } catch (err) {
    console.error("Failed to fetch OUs:", err);
    res.status(500).json({ error: "Failed to fetch OUs" });
  }
});

/**
 * Public: Fetch all divisions for a specific OU (for registration).
 * Access: No auth required.
 */
router.get("/ous/:ouId/divisions/public", async (req, res) => {
  try {
    const divisions = await Division.find({ OU: req.params.ouId }, "_id name");
    res.json(divisions);
  } catch (err) {
    console.error("Failed to fetch divisions for OU (public):", err);
    res.status(500).json({ error: "Failed to fetch divisions for OU" });
  }
});

/**
 * Fetch all divisions for a specific OU.
 * Access: Authenticated users.
 */
router.get("/ous/:ouId/divisions", auth, async (req, res) => {
  try {
    const divisions = await Division.find({ OU: req.params.ouId }, "_id name");
    res.json(divisions);
  } catch (err) {
    console.error("Failed to fetch divisions for OU:", err);
    res.status(500).json({ error: "Failed to fetch divisions for OU" });
  }
});

/**
 * Fetch all divisions for the logged-in user.
 * Access: All authenticated users can view all divisions (for dropdowns).
 * Security: Actual credential access is controlled in credentials routes.
 */
router.get("/divisions/all", auth, async (req, res) => {
  try {
    const divisions = await Division.find({}, "_id name OU");
    res.json(divisions);
  } catch (err) {
    console.error("Division fetch error:", err);
    res.status(500).json({ error: "Failed to fetch divisions" });
  }
});

/**
 * Assign or unassign a user to divisions/OUs (admin only).
 */
router.post(
  "/:userId/assign",
  auth,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.userId);
      if (!user) return res.status(404).json({ error: "User not found" });
      const {
        divisionIds = [],
        ouIds = [],
        divisionsToRemove = [],
        ousToRemove = [],
      } = req.body;
      // Remove divisions
      if (Array.isArray(divisionsToRemove) && divisionsToRemove.length > 0) {
        user.divisions = user.divisions.filter(
          (d) => !divisionsToRemove.includes(d.toString())
        );
      }
      // Remove OUs
      if (Array.isArray(ousToRemove) && ousToRemove.length > 0) {
        user.OUs = user.OUs.filter((o) => !ousToRemove.includes(o.toString()));
      }
      // Add new divisions
      if (Array.isArray(divisionIds) && divisionIds.length > 0) {
        divisionIds.forEach((divisionId) => {
          const castId = new mongoose.Types.ObjectId(divisionId);
          if (!user.divisions.some((d) => d.toString() === castId.toString())) {
            user.divisions.push(castId);
          }
        });
      }
      // Add new OUs
      if (Array.isArray(ouIds) && ouIds.length > 0) {
        ouIds.forEach((ouId) => {
          const castId = new mongoose.Types.ObjectId(ouId);
          if (!user.OUs.some((o) => o.toString() === castId.toString())) {
            user.OUs.push(castId);
          }
        });
      }
      await user.save();
      res.json(user);
    } catch (err) {
      console.error("Failed to assign user:", err);
      res.status(500).json({ error: "Failed to assign user" });
    }
  }
);

/**
 * Change a user's role (admin only).
 */
router.put("/:userId/role", auth, authorizeRoles("admin"), async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    const { role } = req.body;
    if (!["normal", "management", "admin"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }
    user.role = role;
    await user.save();
    res.json(user);
  } catch (err) {
    console.error("Failed to update user role:", err);
    res.status(500).json({ error: "Failed to update user role" });
  }
});

module.exports = router;
