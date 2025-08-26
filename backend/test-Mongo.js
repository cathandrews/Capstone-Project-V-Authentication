// Test script to verify MongoDB connection and server availability.
// Useful for debugging connection issues.

const mongoose = require("mongoose");
require("dotenv").config();

// Attempt to connect to MongoDB and ping the server.
mongoose
  .connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => {
    console.log("MongoDB connected");
    return mongoose.connection.db.admin().ping();
  })
  .then(() => console.log("Ping successful"))
  .catch((err) => console.error("MongoDB connection error:", err));
