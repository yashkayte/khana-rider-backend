const express = require("express");
const router = express.Router();
const {
  createDummyOrders,
  getAvailableOrders,
  getOrderDetails,
  acceptOrder,
  getMyOrders,
  updateOrderStatus,
} = require("../controllers/orders.controller");
const { protect } = require("../middleware/auth");

// Public routes (for demo)
router.post("/create-dummy", createDummyOrders);

// Private routes
router.get("/available", protect, getAvailableOrders);
router.get("/my-orders", protect, getMyOrders);
router.get("/:orderId", protect, getOrderDetails);
router.put("/accept/:orderId", protect, acceptOrder);
router.put("/:orderId/status", protect, updateOrderStatus);

module.exports = router;
