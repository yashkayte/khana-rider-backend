const Rider = require("../models/Rider");
const Order = require("../models/Order");
const Withdrawal = require("../models/Withdrawal");

// @desc    Get rider earnings summary
// @route   GET /api/earnings/summary
// @access  Private
exports.getEarningsSummary = async (req, res, next) => {
  try {
    const rider = await Rider.findById(req.rider.id);

    const completedOrders = await Order.countDocuments({
      riderId: req.rider.id,
      status: "DELIVERED",
    });

    const pendingEarnings = await Order.aggregate([
      {
        $match: {
          riderId: require("mongoose").Types.ObjectId(req.rider.id),
          status: { $in: ["ACCEPTED", "PICKED"] },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$earning" },
        },
      },
    ]);

    res.json({
      success: true,
      earnings: {
        totalEarnings: rider.totalEarnings,
        completedOrders: completedOrders,
        totalOrders: rider.totalOrders,
        pendingEarnings: pendingEarnings[0]?.total || 0,
        balance: rider.totalEarnings,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get delivered orders with earnings
// @route   GET /api/earnings/history
// @access  Private
exports.getEarningsHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const deliveredOrders = await Order.find({
      riderId: req.rider.id,
      status: "DELIVERED",
    })
      .select("orderId customerName earning distance deliveredAt")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ deliveredAt: -1 });

    const total = await Order.countDocuments({
      riderId: req.rider.id,
      status: "DELIVERED",
    });

    const totalEarned = await Order.aggregate([
      {
        $match: {
          riderId: require("mongoose").Types.ObjectId(req.rider.id),
          status: "DELIVERED",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$earning" },
        },
      },
    ]);

    res.json({
      success: true,
      pagination: {
        currentPage: parseInt(page),
        limit: parseInt(limit),
        total: total,
        pages: Math.ceil(total / limit),
      },
      totalEarned: totalEarned[0]?.total || 0,
      orders: deliveredOrders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request withdrawal
// @route   POST /api/earnings/withdraw
// @access  Private
exports.requestWithdrawal = async (req, res, next) => {
  try {
    const { amount, bankDetails } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    const rider = await Rider.findById(req.rider.id);

    if (amount > rider.totalEarnings) {
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. Available: ₹${rider.totalEarnings}`,
      });
    }

    const withdrawal = await Withdrawal.create({
      riderId: req.rider.id,
      amount,
      bankDetails: bankDetails || {},
    });

    res.status(201).json({
      success: true,
      message: "Withdrawal request submitted",
      withdrawal,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get withdrawal history
// @route   GET /api/earnings/withdrawals
// @access  Private
exports.getWithdrawalHistory = async (req, res, next) => {
  try {
    const withdrawals = await Withdrawal.find({
      riderId: req.rider.id,
    }).sort({ createdAt: -1 });

    const totalWithdrawn = withdrawals
      .filter((w) => w.status === "COMPLETED")
      .reduce((sum, w) => sum + w.amount, 0);

    res.json({
      success: true,
      totalWithdrawn,
      count: withdrawals.length,
      withdrawals,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get withdrawal request details
// @route   GET /api/earnings/withdrawals/:withdrawalId
// @access  Private
exports.getWithdrawalDetails = async (req, res, next) => {
  try {
    const withdrawal = await Withdrawal.findById(req.params.withdrawalId);

    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: "Withdrawal request not found",
      });
    }

    // Verify ownership
    if (withdrawal.riderId.toString() !== req.rider.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    res.json({
      success: true,
      withdrawal,
    });
  } catch (error) {
    next(error);
  }
};
