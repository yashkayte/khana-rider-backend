const Rider = require("../models/Rider");
const jwt = require("jsonwebtoken");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || "7d",
  });
};

// @desc    Register a new rider
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, phone, email, password } = req.body;

    // Validation
    if (!name || !phone || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Check if rider already exists
    let rider = await Rider.findOne({
      $or: [{ email }, { phone }],
    });

    if (rider) {
      return res.status(400).json({
        success: false,
        message: "Email or phone number already registered",
      });
    }

    // Create rider
    rider = await Rider.create({
      name,
      phone,
      email,
      passwordHash: password,
    });

    // Generate token
    const token = generateToken(rider._id);

    // Remove password from response
    rider = rider.toObject();
    delete rider.passwordHash;

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      rider,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login rider
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { phone, password } = req.body;

    // Validation
    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide phone and password",
      });
    }

    // Check for rider (include password)
    const rider = await Rider.findOne({ phone }).select("+passwordHash");

    if (!rider) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check password
    const isMatch = await rider.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate token
    const token = generateToken(rider._id);

    // Remove password from response
    const riderData = rider.toObject();
    delete riderData.passwordHash;

    res.json({
      success: true,
      message: "Login successful",
      token,
      rider: riderData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in rider profile
// @route   GET /api/auth/me
// @access  Private
exports.getProfile = async (req, res, next) => {
  try {
    const rider = await Rider.findById(req.rider.id);

    res.json({
      success: true,
      rider,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update rider profile
// @route   PUT /api/auth/update
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    const rider = await Rider.findByIdAndUpdate(
      req.rider.id,
      { name, email },
      {
        new: true,
        runValidators: true,
      }
    );

    res.json({
      success: true,
      message: "Profile updated successfully",
      rider,
    });
  } catch (error) {
    next(error);
  }
};
