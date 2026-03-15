const Rider = require("../models/Rider");
const Kyc = require("../models/kyc");
const Order = require("../models/Order");

exports.getDashboard = async (req, res) => {
  try {

    const { riderId } = req.params;

    const rider = await Rider.findByPk(riderId);

    if (!rider) {
      return res.status(404).json({
        message: "Rider not found"
      });
    }

    const kyc = await Kyc.findOne({
      where: { riderId }
    });

    const totalOrders = await Order.count({
      where: { riderId }
    });

    res.json({
      rider: {
        id: rider.id,
        name: rider.name,
        phone: rider.phone
      },

      kycStatus: kyc ? kyc.status : "not uploaded",

      stats: {
        totalOrders,
        todayEarnings: 0,
        rating: 5
      }
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};