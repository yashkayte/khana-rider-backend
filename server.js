const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const sequelize = require("./config/database");

const authRoutes = require("./src/routes/auth.routes");
const kycRoutes = require("./src/routes/kyc.routes");
// const dashboardRoutes = require("./src/routes/dashboard.routes"); // removed for now

// Load models
require("./src/models/Rider");
require("./src/models/kyc");
require("./src/models/Order");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder for uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running successfully");
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/kyc", kycRoutes);
// app.use("/api/dashboard", dashboardRoutes); // removed for now

const PORT = process.env.PORT || 5000;

// DB connect + server start
sequelize
  .sync()
  .then(() => {
    console.log("SQLite database connected");
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
  });