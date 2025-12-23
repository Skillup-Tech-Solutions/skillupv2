const mongoose = require("mongoose");

const employeeProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    employeeId: { type: String, required: true, unique: true },
    designation: { type: String, required: true },
    department: { type: String, required: true },
    joiningDate: { type: Date, required: true },

    // Personal Details
    dob: { type: Date },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    address: { type: String },

    // Bank Details
    bankName: { type: String },
    accountNumber: { type: String },
    ifscCode: { type: String },
    branchName: { type: String },

    // Statutory Details
    panNumber: { type: String },
    pfNumber: { type: String },
    uanNumber: { type: String },
    esiNumber: { type: String },

    // Custom Fields (for any extra customizable text fields)
    customFields: [{
        label: String,
        value: String
    }],

    status: {
        type: String,
        enum: ["Active", "Resigned", "Terminated"],
        default: "Active"
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

employeeProfileSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model("EmployeeProfile", employeeProfileSchema);
