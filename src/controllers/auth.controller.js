const Rider = require("../models/Rider");

exports.register = async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({
        message: "Name, phone and password are required"
      });
    }

    const existing = await Rider.findOne({ where: { phone } });

    if (existing) {
      return res.status(400).json({
        message: "Phone already registered"
      });
    }

    const rider = await Rider.create({
      name,
      phone,
      email,
      password
    });

    res.status(201).json({
      message: "Rider registered successfully",
      rider
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        message: "Phone and password are required"
      });
    }

    const rider = await Rider.findOne({ where: { phone } });

    if (!rider) {
      return res.status(404).json({
        message: "Rider not found"
      });
    }

    if (rider.password !== password) {
      return res.status(401).json({
        message: "Invalid password"
      });
    }

    res.status(200).json({
      message: "Login successful",
      rider
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};