const User = require("../models/User");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sendInviteEmail = require("../utils/sendInviteMail");

// Create a new student (Admin only)
exports.createStudent = async (req, res) => {
    const { name, email, mobile } = req.body;

    if (!name || !email || !mobile) {
        return res.status(400).json({ message: "Please fill in all fields" });
    }

    if (name.length < 3) {
        return res.status(400).json({ message: "Name must be at least 3 characters long" });
    }

    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
        return res.status(400).json({ message: "Invalid Email Address" });
    }

    if (!/^\d{10}$/.test(mobile)) {
        return res.status(400).json({ message: "Mobile number must be exactly 10 digits" });
    }

    try {
        const userExist = await User.findOne({ email });
        if (userExist) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        const student = await User.create({
            name,
            email,
            mobile,
            role: "student",
            status: "Created"
        });

        res.status(201).json({
            message: "Student created successfully",
            student: {
                _id: student._id,
                name: student.name,
                email: student.email,
                mobile: student.mobile,
                role: student.role,
                status: student.status,
                createdAt: student.createdAt
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get all students (Admin only)
exports.getAllStudents = async (req, res) => {
    try {
        const students = await User.find({ role: "student", status: { $ne: "Deleted" } })
            .select("-password -inviteToken -inviteTokenExpires")
            .sort({ createdAt: -1 });

        res.status(200).json(students);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get student by ID (Admin only)
exports.getStudentById = async (req, res) => {
    try {
        const student = await User.findOne({
            _id: req.params.id,
            role: "student"
        }).select("-password -inviteToken -inviteTokenExpires");

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        res.status(200).json(student);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update student (Admin only)
exports.updateStudent = async (req, res) => {
    const { name, email, mobile, status } = req.body;

    try {
        const student = await User.findOne({ _id: req.params.id, role: "student" });

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Check if email is being changed and if new email already exists
        if (email && email !== student.email) {
            const emailExists = await User.findOne({ email });
            if (emailExists) {
                return res.status(400).json({ message: "Email already in use" });
            }
        }

        const updated = await User.findByIdAndUpdate(
            req.params.id,
            { name, email, mobile, status, updatedAt: Date.now() },
            { new: true }
        ).select("-password -inviteToken -inviteTokenExpires");

        res.status(200).json({ message: "Student updated successfully", student: updated });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete student (soft delete - Admin only)
exports.deleteStudent = async (req, res) => {
    try {
        const student = await User.findOne({ _id: req.params.id, role: "student" });

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        await User.findByIdAndUpdate(req.params.id, {
            status: "Deleted",
            updatedAt: Date.now()
        });

        res.status(200).json({ message: "Student deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Suspend student (Admin only)
exports.suspendStudent = async (req, res) => {
    try {
        const student = await User.findOne({ _id: req.params.id, role: "student" });

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        await User.findByIdAndUpdate(req.params.id, {
            status: "Suspended",
            updatedAt: Date.now()
        });

        res.status(200).json({ message: "Student suspended successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Activate student (Admin only)
exports.activateStudent = async (req, res) => {
    try {
        const student = await User.findOne({ _id: req.params.id, role: "student" });

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        await User.findByIdAndUpdate(req.params.id, {
            status: "Active",
            updatedAt: Date.now()
        });

        res.status(200).json({ message: "Student activated successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Send invite to student (Admin only)
exports.sendInvite = async (req, res) => {
    try {
        const student = await User.findOne({ _id: req.params.id, role: "student" });

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        if (student.status === "Active") {
            return res.status(400).json({ message: "Student is already active" });
        }

        // Generate invite token
        const inviteToken = crypto.randomBytes(32).toString("hex");
        const inviteTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        await User.findByIdAndUpdate(student._id, {
            inviteToken,
            inviteTokenExpires,
            status: "Invited",
            updatedAt: Date.now()
        });

        // Create activation link
        const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, '');
        const activationLink = `${frontendUrl}/#/activate-account?token=${inviteToken}`;

        // Send invite email
        await sendInviteEmail(student.email, student.name, activationLink);

        res.status(200).json({ message: "Invite sent successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Resend invite (Admin only)
exports.resendInvite = async (req, res) => {
    try {
        const student = await User.findOne({ _id: req.params.id, role: "student" });

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        if (student.status === "Active") {
            return res.status(400).json({ message: "Student is already active" });
        }

        // Generate new invite token
        const inviteToken = crypto.randomBytes(32).toString("hex");
        const inviteTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        await User.findByIdAndUpdate(student._id, {
            inviteToken,
            inviteTokenExpires,
            status: "Invited",
            updatedAt: Date.now()
        });

        // Create activation link
        const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, '');
        const activationLink = `${frontendUrl}/#/activate-account?token=${inviteToken}`;

        // Send invite email
        await sendInviteEmail(student.email, student.name, activationLink);

        res.status(200).json({ message: "Invite resent successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
