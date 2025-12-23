const mongoose = require("mongoose");

const salaryStructureSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "EmployeeProfile",
        required: true,
        unique: true
    },
    // Base Components
    basic: { type: Number, default: 0 },
    hra: { type: Number, default: 0 },

    // Flexible Components (Earnings)
    allowances: [{
        name: { type: String, required: true },
        amount: { type: Number, default: 0 },
        taxable: { type: Boolean, default: true }
    }],

    // Flexible Deductions
    deductions: [{
        name: { type: String, required: true }, // e.g., PF, ESI, TDS
        amount: { type: Number, default: 0 },
        isPercentage: { type: Boolean, default: false }, // if true, amount is % of Basic (or other base)
        baseComponent: { type: String } // e.g., "basic" if percentage based
    }],

    totalCTC: { type: Number }, // Annual or Monthly Cache
    netSalary: { type: Number }, // Approx net monthly

    effectiveFrom: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

salaryStructureSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model("SalaryStructure", salaryStructureSchema);
