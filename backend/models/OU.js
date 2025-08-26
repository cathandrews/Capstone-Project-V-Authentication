/**
 * Organizational Unit (OU) Model: Represents a top-level organizational structure.
 * Each OU has a name and optional description.
 */
const mongoose = require("mongoose");

const OUSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
});

module.exports = mongoose.model("OU", OUSchema);
