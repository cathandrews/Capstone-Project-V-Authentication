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

/**
 * Fetch the logged-in user's role, divisions, and OUs.
 */
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id, "role divisions OUs");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({
      role: user.role,
      divisions: user.divisions,
      OUs: user.OUs,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

/**
 * Fetch all users (admin only).
 */
router.get("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }
    const users = await User.find({}, "_id username role");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

/**
 * Fetch all divisions.
 * Access: Admins see all, management sees all in their OUs, normal users see only assigned.
 */
router.get("/divisions/all", auth, async (req, res) => {
  try {
    if (req.user.role === "admin") {
      const divisions = await Division.find({}, "_id name OU");
      return res.json(divisions);
    }
    if (req.user.role === "management") {
      const userOUIds = Array.isArray(req.user.OUs) ? req.user.OUs : [];
      if (userOUIds.length === 0) return res.json([]);
      const divisions = await Division.find(
        { OU: { $in: userOUIds } },
        "_id name OU"
      );
      return res.json(divisions);
    }
    const userDivisionIds = Array.isArray(req.user.divisions)
      ? req.user.divisions
      : [];
    if (userDivisionIds.length === 0) return res.json([]);
    const divisionObjectIds = userDivisionIds.map((id) =>
      mongoose.Types.ObjectId(id)
    );
    const divisions = await Division.find(
      { _id: { $in: divisionObjectIds } },
      "_id name OU"
    );
    res.json(divisions);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch divisions" });
  }
});

/**
 * Fetch all OUs (admin only).
 */
router.get("/ous/all", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }
    const ous = await OU.find({}, "_id name");
    res.json(ous);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch OUs" });
  }
});

/**
 * Fetch a specific user's details (admin only).
 */
router.get("/:userId", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }
    const user = await User.findById(req.params.userId)
      .populate("divisions", "name")
      .populate("OUs", "name");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user details" });
  }
});

/**
 * Fetch all divisions for a specific OU (admin only).
 */
router.get("/ous/:ouId/divisions", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }
    const divisions = await Division.find({ OU: req.params.ouId }, "_id name");
    res.json(divisions);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch divisions for OU" });
  }
});

/**
 * Assign or unassign a user to divisions/OUs (admin only).
 */
router.post("/:userId/assign", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    const { divisionId, ouId, divisionsToRemove, ousToRemove } = req.body;
    if (Array.isArray(divisionsToRemove) && divisionsToRemove.length > 0) {
      user.divisions = user.divisions.filter(
        (d) => !divisionsToRemove.includes(d.toString())
      );
    }
    if (Array.isArray(ousToRemove) && ousToRemove.length > 0) {
      user.OUs = user.OUs.filter((o) => !ousToRemove.includes(o.toString()));
    }
    if (divisionId) {
      const division = await Division.findById(divisionId);
      if (!division)
        return res.status(404).json({ error: "Division not found" });
      if (!user.divisions.includes(divisionId)) user.divisions.push(divisionId);
    }
    if (ouId) {
      const ou = await OU.findById(ouId);
      if (!ou) return res.status(404).json({ error: "OU not found" });
      if (!user.OUs.includes(ouId)) user.OUs.push(ouId);
    }
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to assign user" });
  }
});

/**
 * Change a user's role (admin only).
 */
router.put("/:userId/role", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }
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
    res.status(500).json({ error: "Failed to update user role" });
  }
});

module.exports = router;
