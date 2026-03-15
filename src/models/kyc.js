const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

const Kyc = sequelize.define("Kyc", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  riderId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  aadhaar: {
    type: DataTypes.STRING
  },
  pan: {
    type: DataTypes.STRING
  },
  drivingLicense: {
    type: DataTypes.STRING
  },
  rc: {
    type: DataTypes.STRING
  },
  insurance: {
    type: DataTypes.STRING
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "pending"
  }
});

module.exports = Kyc;