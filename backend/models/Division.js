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

module.exports = mongoose.model("Division", DivisionSchema);
