const mongoose = require("mongoose");

const payrollSettingsSchema = new mongoose.Schema({
    organizationName: { type: String, default: "SkillUp" },
    organizationAddress: { type: String },
    footerNote: { type: String, default: "This is a computer-generated document." },
    logoUrl: { type: String },

    // Default components available for selection
    defaultAllowances: [{ type: String }], // e.g., ["Special Allowance", "Conveyance"]
    defaultDeductions: [{ type: String }], // e.g., ["PF", "Professional Tax"]

    // Payslip Design Config
    themeColor: { type: String, default: "#1a73e8" },
    showLogo: { type: Boolean, default: true },
    templateId: { type: String, default: "classic" }, // "classic", "modern", etc.

    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("PayrollSettings", payrollSettingsSchema);
