// Clears all collections and seeds the database with sample data.
const mongoose = require("mongoose");
require("dotenv").config();
const User = require("./models/User");
const OU = require("./models/OU");
const Division = require("./models/Division");
const Credential = require("./models/Credential");
const bcrypt = require("bcryptjs");

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

const resetDatabase = async () => {
  try {
    console.log("Clearing existing data...");
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

    await newsOU.save();
    await softwareOU.save();
    await hardwareOU.save();
    await opinionOU.save();

    // Create Divisions for each OU
    const divisionsData = [
      // News Management Divisions
      { name: "Admin", OU: newsOU._id },
      { name: "IT", OU: newsOU._id },
      { name: "Finance", OU: newsOU._id },
      { name: "Tech News", OU: newsOU._id },
      { name: "Writing", OU: newsOU._id },
      { name: "Editing", OU: newsOU._id },
      { name: "Research", OU: newsOU._id },
      { name: "Marketing", OU: newsOU._id },
      { name: "HR", OU: newsOU._id },
      { name: "Legal", OU: newsOU._id },
      // Software Reviews Divisions
      { name: "Admin", OU: softwareOU._id },
      { name: "IT", OU: softwareOU._id },
      { name: "Finance", OU: softwareOU._id },
      { name: "Web Development", OU: softwareOU._id },
      { name: "Mobile Development", OU: softwareOU._id },
      { name: "Cloud Computing", OU: softwareOU._id },
      { name: "DevOps", OU: softwareOU._id },
      { name: "AI", OU: softwareOU._id },
      { name: "Cybersecurity", OU: softwareOU._id },
      { name: "Database Management", OU: softwareOU._id },
      // Hardware Reviews Divisions
      { name: "Admin", OU: hardwareOU._id },
      { name: "IT", OU: hardwareOU._id },
      { name: "Finance", OU: hardwareOU._id },
      { name: "Laptops", OU: hardwareOU._id },
      { name: "Desktops", OU: hardwareOU._id },
      { name: "Servers", OU: hardwareOU._id },
      { name: "Networking", OU: hardwareOU._id },
      { name: "Peripherals", OU: hardwareOU._id },
      { name: "Storage", OU: hardwareOU._id },
      { name: "Gaming Hardware", OU: hardwareOU._id },
      // Opinion Publishing Divisions
      { name: "Admin", OU: opinionOU._id },
      { name: "IT", OU: opinionOU._id },
      { name: "Finance", OU: opinionOU._id },
      { name: "Tech Opinions", OU: opinionOU._id },
      { name: "Gaming Opinions", OU: opinionOU._id },
      { name: "Future Tech", OU: opinionOU._id },
      { name: "Social Media", OU: opinionOU._id },
      { name: "Politics", OU: opinionOU._id },
      { name: "Entertainment", OU: opinionOU._id },
      { name: "Lifestyle", OU: opinionOU._id },
    ];

    const savedDivisions = [];
    for (const div of divisionsData) {
      const division = new Division({
        name: div.name,
        OU: div.OU,
        description: `Handles ${div.name} for ${div.OU}`,
      });
      await division.save();
      savedDivisions.push(division);
    }

    // Create Users with hashed passwords
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

    await adminUser.save();
    await managerUser.save();
    await normalUser.save();

    // Create Credentials for each division
    for (const division of savedDivisions) {
      const credential = new Credential({
        title: `Sample Credential for ${division.name}`,
        username: "sampleuser",
        password: "samplepassword",
        url: "https://example.com",
        division: division._id,
      });
      await credential.save();
    }

    console.log("Database seeded successfully!");
    mongoose.connection.close();
  } catch (err) {
    console.error("Error resetting database:", err);
    mongoose.connection.close();
  }
};

// Execute the reset
resetDatabase();
