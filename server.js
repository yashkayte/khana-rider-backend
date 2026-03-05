require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");
const errorHandler = require("./src/middleware/error");

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "Khana Rider Backend API",
    version: "1.0.0",
    status: "running",
  });
});

// API Routes
app.use("/api/auth", require("./src/routes/auth.routes"));
app.use("/api/kyc", require("./src/routes/kyc.routes"));
app.use("/api/orders", require("./src/routes/orders.routes"));
app.use("/api/earnings", require("./src/routes/earnings.routes"));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || "development"}`);
});