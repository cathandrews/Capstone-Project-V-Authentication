/**
 * User Model: Represents a user with authentication details, role, and associations with OUs and divisions.
 * Passwords are automatically hashed before saving.
 */
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  /**
   * Username: Unique identifier for the user.
   * Required, must be unique, trimmed, and between 3 and 30 characters.
   */
  username: {
    type: String,
    required: [true, "Username is required"],
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
  },
  /**
   * Password: Hashed password for authentication.
   * Required and must be at least 6 characters long.
   */
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: 6,
  },
  /**
   * Role: Defines the user's access level.
   * Can be "normal", "management", or "admin". Defaults to "normal".
   */
  role: {
    type: String,
    enum: ["normal", "management", "admin"],
    default: "normal",
  },
  /**
   * OUs: Array of ObjectIds referencing the Organizational Units the user belongs to.
   */
  OUs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OU",
    },
  ],
  /**
   * Divisions: Array of ObjectIds referencing the Divisions the user belongs to.
   */
  divisions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Division",
    },
  ],
});

/**
 * Pre-save hook: Hashes the user's password before saving to the database.
 */
UserSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) return next();
  try {
    // Generate a salt and hash the password
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (err) {
    next(err);
  }
});

/**
 * Method: Compares a candidate password with the stored hash for authentication.
 * @param {string} candidatePassword - The password to compare.
 * @returns {Promise<boolean>} - True if the passwords match, false otherwise.
 */
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
