/**
 * Credential Model: Represents a set of credentials (e.g., login details for a service).
 * Each credential is associated with a division and includes title, username, password, and URL.
 */
const mongoose = require("mongoose");

const CredentialSchema = new mongoose.Schema({
  title: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  url: { type: String, required: true },
  division: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Division",
    required: true,
  },
});

module.exports = mongoose.model("Credential", CredentialSchema);
