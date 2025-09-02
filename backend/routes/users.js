/**
 * User Management Routes: Handles fetching users, divisions, and OUs, and user assignment/role changes.
 * Access is controlled by JWT and user permissions.
 */
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
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
 * Expects: { divisionId, ouId, divisionsToRemove, ousToRemove }
 */
router.post(
  "/:userId/assign",
  auth,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const {
        divisionId,
        ouId,
        divisionsToRemove = [],
        ousToRemove = [],
      } = req.body;

      // Validate userId
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }

      // Find the user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Add new division if provided
      if (divisionId && !user.divisions.includes(divisionId)) {
        user.divisions.push(divisionId);
      }

      // Add new OU if provided
      if (ouId && !user.OUs.includes(ouId)) {
        user.OUs.push(ouId);
      }

      // Remove divisions if provided
      if (divisionsToRemove.length > 0) {
        user.divisions = user.divisions.filter(
          (id) => !divisionsToRemove.includes(id.toString())
        );
      }

      // Remove OUs if provided
      if (ousToRemove.length > 0) {
        user.OUs = user.OUs.filter(
          (id) => !ousToRemove.includes(id.toString())
        );
      }

      // Save the updated user
      await user.save();

      // Generate a new JWT token with the updated user details
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

      // Return the updated user and the new token
      res.json({ message: "User updated successfully", user, token });
    } catch (err) {
      console.error("Assignment error:", err);
      res.status(500).json({ error: "Assignment failed" });
    }
  }
);

/**
 * Change a user's role (admin only).
 * Expects: { role }
 */
router.put("/:userId/role", auth, authorizeRoles("admin"), async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    // Validate role
    if (!["normal", "management", "admin"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    // Find and update the user
    const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate a new JWT token with the updated user details
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

    // Return the updated user and the new token
    res.json({ message: "Role updated successfully", user, token });
  } catch (err) {
    console.error("Role update error:", err);
    res.status(500).json({ error: "Role update failed" });
  }
});

module.exports = router;
