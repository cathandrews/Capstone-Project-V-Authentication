/**
 * Division Model: Represents a division within an Organizational Unit (OU).
 * Each division has a name, optional description, and belongs to an OU.
 */
const mongoose = require("mongoose");

const DivisionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  OU: { type: mongoose.Schema.Types.ObjectId, ref: "OU", required: true },
  description: { type: String },
});

// Add a composite unique index on name and OU
DivisionSchema.index({ name: 1, OU: 1 }, { unique: true });

module.exports = mongoose.model("Division", DivisionSchema);
