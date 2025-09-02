/**
 * Clears all collections and seeds the database with sample data.
 * Fully compatible with MongoDB Atlas and modern MongoDB driver.
 */
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const path = require("path");
// Load .env from the backend folder
dotenv.config({ path: path.join(__dirname, ".env") });
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("MongoDB URI not found in .env file!");
  process.exit(1);
}
console.log("MongoDB URI:", MONGODB_URI);
const User = require("./models/User");
const OU = require("./models/OU");
const Division = require("./models/Division");
const Credential = require("./models/Credential");
// Connect to MongoDB (modern driver, no deprecated options)
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
const resetDatabase = async () => {
  try {
    console.log("Clearing existing data...");
    // Delete existing data
    await User.deleteMany({});
    await OU.deleteMany({});
    await Division.deleteMany({});
    await Credential.deleteMany({});
    console.log("Database cleared!");
    console.log("Seeding database...");
    // Create Organizational Units (OUs)
    const newsOU = new OU({
      name: "News Management",
      description: "Handles news content",
    });
    const softwareOU = new OU({
      name: "Software Reviews",
      description: "Reviews software products",
    });
    const hardwareOU = new OU({
      name: "Hardware Reviews",
      description: "Reviews hardware products",
    });
    const opinionOU = new OU({
      name: "Opinion Publishing",
      description: "Publishes opinion pieces",
    });
    await OU.insertMany([newsOU, softwareOU, hardwareOU, opinionOU]);
    // Divisions
    const divisionsData = [
      // News Management
      { name: "Admin", OU: newsOU._id, description: "Handles admin tasks" },
      { name: "IT", OU: newsOU._id, description: "Handles IT tasks" },
      { name: "Finance", OU: newsOU._id, description: "Handles finance tasks" },
      { name: "Tech News", OU: newsOU._id, description: "Handles tech news" },
      { name: "Writing", OU: newsOU._id, description: "Handles writing tasks" },
      { name: "Editing", OU: newsOU._id, description: "Handles editing tasks" },
      {
        name: "Research",
        OU: newsOU._id,
        description: "Handles research tasks",
      },
      {
        name: "Marketing",
        OU: newsOU._id,
        description: "Handles marketing tasks",
      },
      { name: "HR", OU: newsOU._id, description: "Handles HR tasks" },
      { name: "Legal", OU: newsOU._id, description: "Handles legal tasks" },
      // Software Reviews
      { name: "Admin", OU: softwareOU._id, description: "Handles admin tasks" },
      { name: "IT", OU: softwareOU._id, description: "Handles IT tasks" },
      {
        name: "Finance",
        OU: softwareOU._id,
        description: "Handles finance tasks",
      },
      {
        name: "Web Development",
        OU: softwareOU._id,
        description: "Handles web development",
      },
      {
        name: "Mobile Development",
        OU: softwareOU._id,
        description: "Handles mobile development",
      },
      {
        name: "Cloud Computing",
        OU: softwareOU._id,
        description: "Handles cloud computing",
      },
      {
        name: "DevOps",
        OU: softwareOU._id,
        description: "Handles DevOps tasks",
      },
      { name: "AI", OU: softwareOU._id, description: "Handles AI tasks" },
      {
        name: "Cybersecurity",
        OU: softwareOU._id,
        description: "Handles cybersecurity tasks",
      },
      {
        name: "Database Management",
        OU: softwareOU._id,
        description: "Handles database management",
      },
      // Hardware Reviews
      { name: "Admin", OU: hardwareOU._id, description: "Handles admin tasks" },
      { name: "IT", OU: hardwareOU._id, description: "Handles IT tasks" },
      {
        name: "Finance",
        OU: hardwareOU._id,
        description: "Handles finance tasks",
      },
      { name: "Laptops", OU: hardwareOU._id, description: "Handles laptops" },
      { name: "Desktops", OU: hardwareOU._id, description: "Handles desktops" },
      { name: "Servers", OU: hardwareOU._id, description: "Handles servers" },
      {
        name: "Networking",
        OU: hardwareOU._id,
        description: "Handles networking",
      },
      {
        name: "Peripherals",
        OU: hardwareOU._id,
        description: "Handles peripherals",
      },
      { name: "Storage", OU: hardwareOU._id, description: "Handles storage" },
      {
        name: "Gaming Hardware",
        OU: hardwareOU._id,
        description: "Handles gaming hardware",
      },
      // Opinion Publishing
      { name: "Admin", OU: opinionOU._id, description: "Handles admin tasks" },
      { name: "IT", OU: opinionOU._id, description: "Handles IT tasks" },
      {
        name: "Finance",
        OU: opinionOU._id,
        description: "Handles finance tasks",
      },
      {
        name: "Tech Opinions",
        OU: opinionOU._id,
        description: "Handles tech opinions",
      },
      {
        name: "Gaming Opinions",
        OU: opinionOU._id,
        description: "Handles gaming opinions",
      },
      {
        name: "Future Tech",
        OU: opinionOU._id,
        description: "Handles future tech",
      },
      {
        name: "Social Media",
        OU: opinionOU._id,
        description: "Handles social media",
      },
      { name: "Politics", OU: opinionOU._id, description: "Handles politics" },
      {
        name: "Entertainment",
        OU: opinionOU._id,
        description: "Handles entertainment",
      },
      {
        name: "Lifestyle",
        OU: opinionOU._id,
        description: "Handles lifestyle",
      },
    ];
    const savedDivisions = [];
    for (const div of divisionsData) {
      const division = new Division({
        name: div.name,
        OU: div.OU,
        description: div.description,
      });
      await division.save();
      savedDivisions.push(division);
    }
    // Users
    const adminUser = new User({
      username: "admin",
      password: bcrypt.hashSync("admin123", 10),
      role: "admin",
      OUs: [newsOU._id, softwareOU._id, hardwareOU._id, opinionOU._id],
      divisions: savedDivisions.map((d) => d._id),
    });
    const managerUser = new User({
      username: "manager",
      password: bcrypt.hashSync("manager123", 10),
      role: "management",
      OUs: [newsOU._id, softwareOU._id, hardwareOU._id, opinionOU._id],
      divisions: savedDivisions.map((d) => d._id),
    });
    const normalUser = new User({
      username: "user",
      password: bcrypt.hashSync("user123", 10),
      role: "normal",
      OUs: [softwareOU._id],
      divisions: savedDivisions
        .filter((d) => d.OU.toString() === softwareOU._id.toString())
        .map((d) => d._id),
    });
    await User.insertMany([adminUser, managerUser, normalUser]);
    // Credentials
    const credentials = savedDivisions.map((division) => ({
      title: `Sample Credential for ${division.name}`,
      username: "sampleuser",
      password: "samplepassword",
      url: "https://example.com",
      division: division._id,
    }));
    await Credential.insertMany(credentials);
    console.log("Database seeded successfully!");
    mongoose.connection.close();
  } catch (err) {
    console.error("Error resetting database:", err);
    mongoose.connection.close();
  }
};
// Execute the reset
resetDatabase();
