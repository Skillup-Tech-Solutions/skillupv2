const User = require("../models/User");
const StudentAssignment = require("../models/StudentAssignment");
const Announcement = require("../models/Announcement");
const { validateName, validateMobile } = require("../utils/validation");

// Get my profile
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id)
            .select("-password -inviteToken -inviteTokenExpires")
            .lean();

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
    } catch (err) {
        next(err);
    }
};

// Update my profile
exports.updateMe = async (req, res, next) => {
    const { name, mobile } = req.body;

    const nameError = name ? validateName(name) : null;
    if (nameError) return res.status(400).json({ message: nameError });

    const mobileError = mobile ? validateMobile(mobile) : null;
    if (mobileError) return res.status(400).json({ message: mobileError });

    try {
        const updated = await User.findByIdAndUpdate(
            req.user.id,
            { name, mobile, updatedAt: Date.now() },
            { new: true }
        ).select("-password -inviteToken -inviteTokenExpires");

        res.status(200).json({ message: "Profile updated", user: updated });
    } catch (err) {
        next(err);
    }
};

// Get my courses
exports.getMyCourses = async (req, res, next) => {
    try {
        const assignments = await StudentAssignment.find({
            student: req.user.id,
            itemType: "course"
        }).populate("itemId").sort({ assignedAt: -1 }).lean();

        res.status(200).json(assignments);
    } catch (err) {
        next(err);
    }
};

// Get my internships
exports.getMyInternships = async (req, res, next) => {
    try {
        const assignments = await StudentAssignment.find({
            student: req.user.id,
            itemType: "internship"
        }).populate("itemId").sort({ assignedAt: -1 }).lean();

        res.status(200).json(assignments);
    } catch (err) {
        next(err);
    }
};

// Get my projects
exports.getMyProjects = async (req, res, next) => {
    try {
        const assignments = await StudentAssignment.find({
            student: req.user.id,
            itemType: "project"
        }).populate("itemId").populate("submission").sort({ assignedAt: -1 }).lean();

        res.status(200).json(assignments);
    } catch (err) {
        next(err);
    }
};

// Get all my assignments
exports.getMyAssignments = async (req, res, next) => {
    try {
        const assignments = await StudentAssignment.find({ student: req.user.id })
            .populate("itemId")
            .populate("submission")
            .sort({ assignedAt: -1 })
            .lean();

        const grouped = {
            courses: assignments.filter(a => a.itemType === "course"),
            internships: assignments.filter(a => a.itemType === "internship"),
            projects: assignments.filter(a => a.itemType === "project")
        };

        res.status(200).json({ assignments, grouped });
    } catch (err) {
        next(err);
    }
};

// Get dashboard stats
exports.getDashboard = async (req, res, next) => {
    try {
        const assignments = await StudentAssignment.find({ student: req.user.id }).lean();

        const stats = {
            totalCourses: assignments.filter(a => a.itemType === "course").length,
            totalInternships: assignments.filter(a => a.itemType === "internship").length,
            totalProjects: assignments.filter(a => a.itemType === "project").length,
            completed: assignments.filter(a => a.status === "completed").length,
            inProgress: assignments.filter(a => a.status === "in-progress").length,
            assigned: assignments.filter(a => a.status === "assigned").length
        };

        const announcements = await Announcement.find({
            isActive: true,
            targetAudience: { $in: ["all", "students"] }
        })
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        res.status(200).json({ stats, recentAnnouncements: announcements });
    } catch (err) {
        next(err);
    }
};

// Get announcements
exports.getAnnouncements = async (req, res, next) => {
    try {
        const announcements = await Announcement.find({
            isActive: true,
            targetAudience: { $in: ["all", "students"] }
        })
            .populate("createdBy", "name")
            .sort({ priority: -1, createdAt: -1 })
            .lean();

        res.status(200).json(announcements);
    } catch (err) {
        next(err);
    }
};
