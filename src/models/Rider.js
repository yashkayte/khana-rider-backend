const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const riderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a ride name"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      match: [/^[6-9]\d{9}$/, "Please provide a valid Indian phone number"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Invalid email format"],
    },
    passwordHash: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    kyc: {
      aadharNumber: {
        type: String,
        trim: true,
      },
      panNumber: {
        type: String,
        trim: true,
      },
      drivingLicenseNumber: {
        type: String,
        trim: true,
      },
      status: {
        type: String,
        enum: ["NOT_SUBMITTED", "PENDING", "APPROVED", "REJECTED"],
        default: "NOT_SUBMITTED",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    totalEarnings: {
      type: Number,
      default: 0,
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 5.0,
      min: [1, "Rating cannot be less than 1"],
      max: [5, "Rating cannot exceed 5"],
    },
  },
  { timestamps: true }
);

// Hash password before saving
riderSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
riderSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

module.exports = mongoose.model("Rider", riderSchema);
