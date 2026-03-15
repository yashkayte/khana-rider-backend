const Kyc = require("../models/kyc");

exports.uploadKyc = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILES:", req.files);

    const { riderId } = req.body;

    if (!riderId) {
      return res.status(400).json({
        message: "riderId is required"
      });
    }

    const kyc = await Kyc.create({
      riderId,
      aadhaar: req.files?.aadhaar?.[0]?.filename || null,
      pan: req.files?.pan?.[0]?.filename || null,
      drivingLicense: req.files?.drivingLicense?.[0]?.filename || null,
      rc: req.files?.rc?.[0]?.filename || null,
      insurance: req.files?.insurance?.[0]?.filename || null,
      status: "pending"
    });

    res.status(201).json({
      message: "KYC uploaded successfully",
      kyc
    });
  } catch (error) {
    console.error("KYC upload error:", error);
    res.status(500).json({
      error: error.message
    });
  }
};

exports.getPendingKyc = async (req, res) => {
  try {
    const kycs = await Kyc.findAll({
      where: { status: "pending" }
    });

    res.json({
      message: "Pending KYC list",
      kycs
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};

exports.getAllKyc = async (req, res) => {
  try {
    const kycs = await Kyc.findAll();

    res.json({
      message: "All KYC list",
      kycs
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};

exports.approveKyc = async (req, res) => {
  try {
    const { id } = req.params;

    const kyc = await Kyc.findByPk(id);

    if (!kyc) {
      return res.status(404).json({
        message: "KYC not found"
      });
    }

    kyc.status = "approved";
    await kyc.save();

    res.json({
      message: "KYC approved",
      kyc
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};

exports.rejectKyc = async (req, res) => {
  try {
    const { id } = req.params;

    const kyc = await Kyc.findByPk(id);

    if (!kyc) {
      return res.status(404).json({
        message: "KYC not found"
      });
    }

    kyc.status = "rejected";
    await kyc.save();

    res.json({
      message: "KYC rejected",
      kyc
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};