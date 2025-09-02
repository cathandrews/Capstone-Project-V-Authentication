// Main server entry point: Sets up Express, middleware, routes, and MongoDB connection.
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
// Initialize Express app.
const app = express();
// Middleware to enable CORS and parse JSON requests.
app.use(cors());
app.use(express.json());
// Import and use route files for different API endpoints.
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);
const credentialRoutes = require("./routes/credentials");
app.use("/api/credentials", credentialRoutes);
const divisionRoutes = require("./routes/divisions");
app.use("/api/divisions", divisionRoutes);
const userRoutes = require("./routes/users");
app.use("/api/users", userRoutes);
// Connect to MongoDB using the URI from environment variables.
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));
// Basic route for server status.
app.get("/", (req, res) => {
  res.send("CoolTech Credential Manager API");
});
// Start the server on the specified port.
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
