const Rider = require("../models/Rider");

// @desc    Submit KYC details
// @route   POST /api/kyc/submit
// @access  Private
exports.submitKYC = async (req, res, next) => {
  try {
    const { aadharNumber, panNumber, drivingLicenseNumber } = req.body;

    // Validation
    if (!aadharNumber || !panNumber || !drivingLicenseNumber) {
      return res.status(400).json({
        success: false,
        message: "Please provide all KYC details",
      });
    }

    // Update KYC details
    const rider = await Rider.findByIdAndUpdate(
      req.rider.id,
      {
        $set: {
          "kyc.aadharNumber": aadharNumber,
          "kyc.panNumber": panNumber,
          "kyc.drivingLicenseNumber": drivingLicenseNumber,
          "kyc.status": "PENDING",
        },
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: "KYC submitted successfully. It will be verified shortly",
      rider,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get KYC status
// @route   GET /api/kyc/status
// @access  Private
exports.getKYCStatus = async (req, res, next) => {
  try {
    const rider = await Rider.findById(req.rider.id);

    res.json({
      success: true,
      kyc: rider.kyc,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all KYC submissions (Admin only - for demo)
// @route   GET /api/kyc/all
// @access  Public
exports.getAllKYC = async (req, res, next) => {
  try {
    const kycs = await Rider.find(
      { "kyc.status": { $ne: "NOT_SUBMITTED" } },
      { name: 1, phone: 1, kyc: 1, createdAt: 1 }
    );

    res.json({
      success: true,
      count: kycs.length,
      kycs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve KYC (Admin only - for demo)
// @route   PUT /api/kyc/approve/:riderId
// @access  Public
exports.approveKYC = async (req, res, next) => {
  try {
    const { riderId } = req.params;

    const rider = await Rider.findByIdAndUpdate(
      riderId,
      { $set: { "kyc.status": "APPROVED" } },
      { new: true }
    );

    if (!rider) {
      return res.status(404).json({
        success: false,
        message: "Rider not found",
      });
    }

    res.json({
      success: true,
      message: "KYC approved",
      rider,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject KYC (Admin only - for demo)
// @route   PUT /api/kyc/reject/:riderId
// @access  Public
exports.rejectKYC = async (req, res, next) => {
  try {
    const { riderId } = req.params;
    const { reason } = req.body;

    const rider = await Rider.findByIdAndUpdate(
      riderId,
      { $set: { "kyc.status": "REJECTED" } },
      { new: true }
    );

    if (!rider) {
      return res.status(404).json({
        success: false,
        message: "Rider not found",
      });
    }

    res.json({
      success: true,
      message: "KYC rejected",
      reason: reason || "Not specified",
      rider,
    });
  } catch (error) {
    next(error);
  }
};
