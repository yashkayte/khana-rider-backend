const router = require("express").Router();
const admin = require("../config/firebase");
const Rider = require("../models/Rider");

router.post("/firebase", async (req, res) => {

  try {

    const { idToken } = req.body;

    const decoded = await admin.auth().verifyIdToken(idToken);

    const phone = decoded.phone_number;

    let rider = await Rider.findOne({ phone });

    if (!rider) {

      rider = await Rider.create({
        phone: phone
      });

    }

    res.json({
      message: "Login success",
      rider: rider
    });

  } catch (error) {

    res.status(401).json({
      message: "Invalid token"
    });

  }

});

module.exports = router;