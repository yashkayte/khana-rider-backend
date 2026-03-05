const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getProfile,
  updateProfile,
} = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth");

// Public routes
router.post("/register", register);
router.post("/login", login);

// Private routes
router.get("/me", protect, getProfile);
router.put("/update", protect, updateProfile);

module.exports = router;
