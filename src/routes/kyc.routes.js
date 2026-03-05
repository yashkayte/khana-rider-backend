const express = require("express");
const router = express.Router();
const {
  submitKYC,
  getKYCStatus,
  getAllKYC,
  approveKYC,
  rejectKYC,
} = require("../controllers/kyc.controller");
const { protect } = require("../middleware/auth");

// Private routes
router.post("/submit", protect, submitKYC);
router.get("/status", protect, getKYCStatus);

// Admin routes (public for demo)
router.get("/all", getAllKYC);
router.put("/approve/:riderId", approveKYC);
router.put("/reject/:riderId", rejectKYC);

module.exports = router;
