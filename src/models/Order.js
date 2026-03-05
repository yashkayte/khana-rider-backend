const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      required: true,
    },
    pickupLocation: {
      address: String,
      lat: Number,
      lng: Number,
    },
    dropLocation: {
      address: String,
      lat: Number,
      lng: Number,
    },
    customerName: {
      type: String,
      required: true,
    },
    customerPhone: {
      type: String,
      required: true,
    },
    customerEmail: String,
    status: {
      type: String,
      enum: ["NEW", "ACCEPTED", "PICKED", "DELIVERED", "CANCELLED"],
      default: "NEW",
    },
    riderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rider",
      default: null,
    },
    earning: {
      type: Number,
      default: 0,
    },
    distance: {
      type: Number,
      default: 0,
    },
    estimatedTime: {
      type: Number,
      default: 0,
    },
    description: String,
    instructions: String,
    otp: {
      type: String,
      default: null,
    },
    acceptedAt: Date,
    pickedAt: Date,
    deliveredAt: Date,
  },
  { timestamps: true }
);

// Auto-generate orderId before saving
orderSchema.pre("save", async function (next) {
  if (!this.orderId) {
    const count = await mongoose.model("Order").countDocuments();
    this.orderId = `ORD-${Date.now()}-${count + 1}`;
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);
