const User = require("../models/User");
const EmployeeProfile = require("../models/EmployeeProfile");
const SalaryStructure = require("../models/SalaryStructure");
const sendInviteMail = require("../utils/sendInviteMail");
const crypto = require("crypto");

/**
 * Create a new Employee
 * Creates a User record with role 'employee' and an EmployeeProfile
 */
exports.createEmployee = async (req, res) => {
    try {
        const {
            name, email, mobile,
            designation, department, joiningDate, employeeId,
            // ...other profile fields
            gender, dob, address,
            bankName, accountNumber, ifscCode,
            panNumber, uanNumber, esiNumber
        } = req.body;

        // Validate required fields
        if (!name || !email || !employeeId || !designation || !department || !joiningDate) {
            return res.status(400).json({ 
                message: "Missing required fields: name, email, employeeId, designation, department, and joiningDate are required" 
            });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        // Check if employeeId exists (in profile)
        const existingId = await EmployeeProfile.findOne({ employeeId });
        if (existingId) {
            return res.status(400).json({ message: "Employee ID already exists" });
        }

        // Create User
        // Generate random password or handle invite flow
        const inviteToken = crypto.randomBytes(32).toString("hex");
        const user = new User({
            name,
            email,
            mobile,
            role: "employee",
            status: "Invited",
            inviteToken,
            inviteTokenExpires: Date.now() + 3600000 * 24 * 7 // 7 days
        });

        await user.save();

        // Create Profile
        const profile = new EmployeeProfile({
            user: user._id,
            employeeId,
            designation,
            department,
            joiningDate,
            gender, dob, address,
            bankName, accountNumber, ifscCode,
            panNumber, uanNumber, esiNumber
        });

        await profile.save();

        // Send Invite Email
        const inviteLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/#/set-password/${inviteToken}`;
        try {
            await sendInviteMail(email, name, inviteLink);
        } catch (emailErr) {
            console.error("Failed to send invite email:", emailErr);
            // Don't fail the request, just warn
        }

        res.status(201).json({
            message: "Employee created successfully",
            employee: { ...user.toObject(), profile: profile }
        });

    } catch (err) {
        console.error("Create Employee Error:", err);
        res.status(500).json({ message: err.message });
    }
};

/**
 * Get All Employees
 */
exports.getAllEmployees = async (req, res) => {
    try {
        const profiles = await EmployeeProfile.find()
            .populate("user", "name email mobile status")
            .sort({ "user.name": 1 });

        res.status(200).json(profiles);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * Get Single Employee
 */
exports.getEmployeeById = async (req, res) => {
    try {
        const profile = await EmployeeProfile.findById(req.params.id)
            .populate("user", "name email mobile status");

        if (!profile) return res.status(404).json({ message: "Employee not found" });

        // Also fetch salary structure if exists
        const salaryStructure = await SalaryStructure.findOne({ employee: profile._id });

        res.status(200).json({ profile, salaryStructure });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * Update Salary Structure
 */
exports.updateSalaryStructure = async (req, res) => {
    try {
        const { employeeProfileId } = req.params;
        const { basic, hra, allowances, deductions } = req.body;

        let structure = await SalaryStructure.findOne({ employee: employeeProfileId });

        if (!structure) {
            structure = new SalaryStructure({ employee: employeeProfileId });
        }

        structure.basic = basic || 0;
        structure.hra = hra || 0;
        structure.allowances = allowances || []; // Ensure array of {name, amount}
        structure.deductions = deductions || []; // Ensure array of {name, amount}

        // Recalculate Totals (Optional helper)
        const totalEarnings = structure.basic + structure.hra + (structure.allowances.reduce((acc, curr) => acc + (curr.amount || 0), 0));
        // Note: Deductions might be percentage based, need logic. For now assuming absolute.
        // If percentage logic needed, we should calc it here.
        // Simply storing configuration here. Calculation happens during Payslip Generation.

        structure.totalCTC = totalEarnings * 12; // Crude approximation

        await structure.save();

        res.status(200).json({ message: "Salary structure updated", structure });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * Update Employee Profile
 */
exports.updateEmployeeProfile = async (req, res) => {
    try {
        const { id } = req.params; // Profile ID
        const updates = req.body;

        const profile = await EmployeeProfile.findByIdAndUpdate(id, updates, { new: true });

        // Also update User basics if provided
        if (updates.name || updates.mobile) {
            const userUpdates = {};
            if (updates.name) userUpdates.name = updates.name;
            if (updates.mobile) userUpdates.mobile = updates.mobile;
            await User.findByIdAndUpdate(profile.user, userUpdates);
        }

        res.status(200).json({ message: "Profile updated", profile });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
