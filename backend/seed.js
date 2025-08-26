// Database seeder script: Populates MongoDB with sample data for testing.
// This script clears existing data and inserts sample OUs, divisions, users, and credentials.

const mongoose = require("mongoose");
const User = require("./models/User");
const OU = require("./models/OU");
const Division = require("./models/Division");
const Credential = require("./models/Credential");
require("dotenv").config();

// Connect to MongoDB using the URI from environment variables.
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Function to seed the database with sample data.
const seedDatabase = async () => {
  // Clear existing data to avoid duplicates.
  await User.deleteMany({});
  await OU.deleteMany({});
  await Division.deleteMany({});
  await Credential.deleteMany({});

  // Create sample Organizational Units (OUs).
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

  // Create sample divisions under each OU.
  const newsFinance = new Division({
    name: "Finance",
    OU: newsOU._id,
    description: "Handles finances for News",
  });
  const softwareIT = new Division({
    name: "IT",
    OU: softwareOU._id,
    description: "IT support for Software",
  });
  const hardwareSupport = new Division({
    name: "Support",
    OU: hardwareOU._id,
    description: "Support for Hardware",
  });
  const opinionEditing = new Division({
    name: "Editing",
    OU: opinionOU._id,
    description: "Editing for Opinion",
  });
  await newsFinance.save();
  await softwareIT.save();
  await hardwareSupport.save();
  await opinionEditing.save();

  // Create sample users with different roles and associations.
  const adminUser = new User({
    username: "admin",
    password: "admin123",
    role: "admin",
    OUs: [newsOU._id, softwareOU._id, hardwareOU._id, opinionOU._id],
    divisions: [
      newsFinance._id,
      softwareIT._id,
      hardwareSupport._id,
      opinionEditing._id,
    ],
  });
  const normalUser = new User({
    username: "user1",
    password: "user123",
    role: "normal",
    OUs: [newsOU._id],
    divisions: [newsFinance._id],
  });
  await adminUser.save();
  await normalUser.save();

  // Create sample credentials for each division.
  const newsCredential = new Credential({
    title: "News CMS",
    username: "news_admin",
    password: "securepassword123",
    url: "https://news.cms.cooltech.com",
    division: newsFinance._id,
  });
  const softwareCredential = new Credential({
    title: "Software Portal",
    username: "software_admin",
    password: "softwarepass123",
    url: "https://software.portal.cooltech.com",
    division: softwareIT._id,
  });
  const hardwareCredential = new Credential({
    title: "Hardware Support Portal",
    username: "hardware_admin",
    password: "hardwarepass123",
    url: "https://hardware.portal.cooltech.com",
    division: hardwareSupport._id,
  });
  const opinionCredential = new Credential({
    title: "Opinion CMS",
    username: "opinion_admin",
    password: "opinionpass123",
    url: "https://opinion.cms.cooltech.com",
    division: opinionEditing._id,
  });
  await newsCredential.save();
  await softwareCredential.save();
  await hardwareCredential.save();
  await opinionCredential.save();

  console.log("Database seeded!");
  mongoose.connection.close();
};

// Execute the seeding function.
seedDatabase();
