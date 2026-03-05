const Order = require("../models/Order");
const Rider = require("../models/Rider");

// @desc    Create dummy orders
// @route   POST /api/orders/create-dummy
// @access  Public (for demo)
exports.createDummyOrders = async (req, res, next) => {
  try {
    const dummyOrders = [
      {
        pickupLocation: {
          address: "123 Main Street, Downtown",
          lat: 28.6139,
          lng: 77.209,
        },
        dropLocation: {
          address: "456 Park Avenue, Uptown",
          lat: 28.5355,
          lng: 77.391,
        },
        customerName: "Rajesh Kumar",
        customerPhone: "9876543210",
        customerEmail: "rajesh@example.com",
        earning: 150,
        distance: 5.2,
        estimatedTime: 20,
        description: "Parcel delivery",
      },
      {
        pickupLocation: {
          address: "789 Business Plaza",
          lat: 28.6292,
          lng: 77.1584,
        },
        dropLocation: {
          address: "Sector 18, Noida",
          lat: 28.5921,
          lng: 77.359,
        },
        customerName: "Priya Sharma",
        customerPhone: "9876543211",
        customerEmail: "priya@example.com",
        earning: 200,
        distance: 8.5,
        estimatedTime: 30,
        description: "Urgent package",
      },
      {
        pickupLocation: {
          address: "Shopping Mall, Connaught Place",
          lat: 28.6298,
          lng: 77.186,
        },
        dropLocation: {
          address: "Residential Complex, Dwarka",
          lat: 28.5921,
          lng: 77.0460,
        },
        customerName: "Amit Singh",
        customerPhone: "9876543212",
        customerEmail: "amit@example.com",
        earning: 180,
        distance: 6.8,
        estimatedTime: 25,
        description: "Food delivery",
      },
      {
        pickupLocation: {
          address: "Market Street, Karol Bagh",
          lat: 28.6465,
          lng: 77.1983,
        },
        dropLocation: {
          address: "Hospital, Safdarjung",
          lat: 28.5709,
          lng: 77.1934,
        },
        customerName: "Neha Patel",
        customerPhone: "9876543213",
        customerEmail: "neha@example.com",
        earning: 120,
        distance: 4.2,
        estimatedTime: 15,
        description: "Medical supplies",
      },
      {
        pickupLocation: {
          address: "Bank, Green Park",
          lat: 28.5244,
          lng: 77.2060,
        },
        dropLocation: {
          address: "Office Complex, Aerocity",
          lat: 28.5648,
          lng: 77.0968,
        },
        customerName: "Vikram Verma",
        customerPhone: "9876543214",
        customerEmail: "vikram@example.com",
        earning: 250,
        distance: 10.5,
        estimatedTime: 35,
        description: "Document delivery",
      },
    ];

    const createdOrders = await Order.insertMany(dummyOrders);

    res.status(201).json({
      success: true,
      message: `${createdOrders.length} dummy orders created`,
      count: createdOrders.length,
      orders: createdOrders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all available orders (not accepted yet)
// @route   GET /api/orders/available
// @access  Private
exports.getAvailableOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({
      status: "NEW",
      riderId: null,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order details
// @route   GET /api/orders/:orderId
// @access  Private
exports.getOrderDetails = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId).populate(
      "riderId",
      "name phone email rating"
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept order
// @route   PUT /api/orders/accept/:orderId
// @access  Private
exports.acceptOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.status !== "NEW") {
      return res.status(400).json({
        success: false,
        message: "Order is not available",
      });
    }

    // Assign order to rider
    order.riderId = req.rider.id;
    order.status = "ACCEPTED";
    order.acceptedAt = new Date();

    // Generate OTP for delivery
    order.otp = Math.random().toString().slice(2, 8);

    await order.save();

    // Update rider stats
    await Rider.findByIdAndUpdate(req.rider.id, {
      $inc: { totalOrders: 1 },
    });

    res.json({
      success: true,
      message: "Order accepted successfully",
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get rider's orders
// @route   GET /api/orders/my-orders
// @access  Private
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ riderId: req.rider.id }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:orderId/status
// @access  Private
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ["PICKED", "DELIVERED", "CANCELLED"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Verify order belongs to rider
    if (order.riderId.toString() !== req.rider.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this order",
      });
    }

    order.status = status;

    if (status === "PICKED") {
      order.pickedAt = new Date();
    } else if (status === "DELIVERED") {
      order.deliveredAt = new Date();
      // Add earnings to rider
      await Rider.findByIdAndUpdate(req.rider.id, {
        $inc: { totalEarnings: order.earning },
      });
    }

    await order.save();

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      order,
    });
  } catch (error) {
    next(error);
  }
};
