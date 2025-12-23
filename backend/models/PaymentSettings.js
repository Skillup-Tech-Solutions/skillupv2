const mongoose = require("mongoose");

const paymentSettingsSchema = new mongoose.Schema({
    enableBankTransfer: { type: Boolean, default: false },
    bankDetails: {
        accountHolderName: String,
        accountNumber: String,
        bankName: String,
        ifsc: String
    },
    enableUPI: { type: Boolean, default: true },
    upiId: { type: String },
    qrUrl: { type: String }, // Proxy URL returned by b2Service
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("PaymentSettings", paymentSettingsSchema);
