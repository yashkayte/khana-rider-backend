const mongoose = require("mongoose");

const RiderSchema = new mongoose.Schema({
  phone: String,
  email: String,
  name: String,
  vehicleNumber: String,
  kycStatus: {
    type: String,
    default: "PENDING",
  },
});

module.exports = mongoose.model("Rider", RiderSchema);