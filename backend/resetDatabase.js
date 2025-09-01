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
    const newsOU = new OU({ name: "News Management", description: "Handles news content" });
    const softwareOU = new OU({ name: "Software Reviews", description: "Reviews software products" });
    const hardwareOU = new OU({ name: "Hardware Reviews", description: "Reviews hardware products" });
    const opinionOU = new OU({ name: "Opinion Publishing", description: "Publishes opinion pieces" });

    await OU.insertMany([newsOU, softwareOU, hardwareOU, opinionOU]);

    // Divisions
    const divisionsData = [
      // News Management
      { name: "Admin", OU: newsOU._id }, { name: "IT", OU: newsOU._id }, { name: "Finance", OU: newsOU._id },
      { name: "Tech News", OU: newsOU._id }, { name: "Writing", OU: newsOU._id }, { name: "Editing", OU: newsOU._id },
      { name: "Research", OU: newsOU._id }, { name: "Marketing", OU: newsOU._id }, { name: "HR", OU: newsOU._id },
      { name: "Legal", OU: newsOU._id },

      // Software Reviews
      { name: "Admin", OU: softwareOU._id }, { name: "IT", OU: softwareOU._id }, { name: "Finance", OU: softwareOU._id },
      { name: "Web Development", OU: softwareOU._id }, { name: "Mobile Development", OU: softwareOU._id },
      { name: "Cloud Computing", OU: softwareOU._id }, { name: "DevOps", OU: softwareOU._id }, { name: "AI", OU: softwareOU._id },
      { name: "Cybersecurity", OU: softwareOU._id }, { name: "Database Management", OU: softwareOU._id },

      // Hardware Reviews
      { name: "Admin", OU: hardwareOU._id }, { name: "IT", OU: hardwareOU._id }, { name: "Finance", OU: hardwareOU._id },
      { name: "Laptops", OU: hardwareOU._id }, { name: "Desktops", OU: hardwareOU._id }, { name: "Servers", OU: hardwareOU._id },
      { name: "Networking", OU: hardwareOU._id }, { name: "Peripherals", OU: hardwareOU._id }, { name: "Storage", OU: hardwareOU._id },
      { name: "Gaming Hardware", OU: hardwareOU._id },

      // Opinion Publishing
      { name: "Admin", OU: opinionOU._id }, { name: "IT", OU: opinionOU._id }, { name: "Finance", OU: opinionOU._id },
      { name: "Tech Opinions", OU: opinionOU._id }, { name: "Gaming Opinions", OU: opinionOU._id },
      { name: "Future Tech", OU: opinionOU._id }, { name: "Social Media", OU: opinionOU._id },
      { name: "Politics", OU: opinionOU._id }, { name: "Entertainment", OU: opinionOU._id }, { name: "Lifestyle", OU: opinionOU._id },
    ];

    const savedDivisions = [];
    for (const div of divisionsData) {
      const division = new Division({
        name: div.name,
        OU: div.OU,
        description: `Handles ${div.name}`,
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
      divisions: savedDivisions.filter((d) => d.OU.toString() === softwareOU._id.toString()).map((d) => d._id),
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
