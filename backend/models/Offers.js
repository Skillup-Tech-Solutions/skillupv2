const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
}, { timestamps: true });

module.exports = mongoose.model("Offer", offerSchema);
