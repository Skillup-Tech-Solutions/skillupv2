const mongoose = require("mongoose");

const payslipSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "EmployeeProfile",
        required: true
    },
    month: { type: String, required: true }, // e.g., "January", "01"
    year: { type: Number, required: true }, // e.g., 2024
    attendanceDays: { type: Number, default: 30 }, // Days present

    // Snapshot of values at generation time
    basic: { type: Number, default: 0 },
    hra: { type: Number, default: 0 },
    allowances: [{
        name: String,
        amount: Number
    }],
    deductions: [{
        name: String,
        amount: Number
    }],

    grossEarnings: { type: Number, required: true },
    totalDeductions: { type: Number, required: true },
    netPay: { type: Number, required: true },

    // Digital
    pdfUrl: { type: String }, // Path to stored PDF (S3/B2/Local)
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    generatedAt: { type: Date, default: Date.now },

    status: {
        type: String,
        enum: ["Draft", "Published", "Emailed"],
        default: "Draft"
    },

    emailSent: { type: Boolean, default: false },
    emailSentAt: { type: Date }
});

// Composite unique index to prevent duplicate payslips for same month/year
payslipSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model("Payslip", payslipSchema);
