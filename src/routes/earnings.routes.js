const express = require("express");
const router = express.Router();
const {
  getEarningsSummary,
  getEarningsHistory,
  requestWithdrawal,
  getWithdrawalHistory,
  getWithdrawalDetails,
} = require("../controllers/earnings.controller");
const { protect } = require("../middleware/auth");

// Private routes
router.get("/summary", protect, getEarningsSummary);
router.get("/history", protect, getEarningsHistory);
router.post("/withdraw", protect, requestWithdrawal);
router.get("/withdrawals", protect, getWithdrawalHistory);
router.get("/withdrawals/:withdrawalId", protect, getWithdrawalDetails);

module.exports = router;
