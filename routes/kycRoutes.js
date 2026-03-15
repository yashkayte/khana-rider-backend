const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");
const {
  uploadKyc,
  getPendingKyc,
  getAllKyc,
  approveKyc,
  rejectKyc
} = require("../controllers/kyc.controller");

router.post(
  "/upload",
  upload.fields([
    { name: "aadhaar", maxCount: 1 },
    { name: "pan", maxCount: 1 },
    { name: "drivingLicense", maxCount: 1 },
    { name: "rc", maxCount: 1 },
    { name: "insurance", maxCount: 1 }
  ]),
  uploadKyc
);

router.get("/pending", getPendingKyc);
router.get("/all", getAllKyc);
router.put("/approve/:id", approveKyc);
router.put("/reject/:id", rejectKyc);

module.exports = router;