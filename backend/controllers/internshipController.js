const Internship = require("../models/Internship");

// Create internship (Admin only)
exports.createInternship = async (req, res) => {
    const { title, description, company, department, duration, mode, startDate, endDate, mentor, mentorEmail, dailyTasks, responsibilities, skills, stipend, stipendFrequency, status, attachments } = req.body;

    if (!title || !description || !company || !mentor || !startDate || !endDate || !duration) {
        return res.status(400).json({ message: "Title, description, company, mentor, duration, start date, and end date are required" });
    }

    try {
        const internship = await Internship.create({
            title,
            description,
            company,
            department,
            duration,
            mode: mode || "on-site",
            startDate,
            endDate,
            mentor,
            mentorEmail,
            dailyTasks,
            responsibilities: responsibilities || [],
            skills: skills || [],
            stipend: stipend || 0,
            stipendFrequency: stipendFrequency || "monthly",
            status: status || "Active",
            attachments: attachments || [],
            createdBy: req.user?.id
        });

        res.status(201).json({
            message: "Internship created successfully",
            internship
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get all internships
exports.getAllInternships = async (req, res) => {
    try {
        const internships = await Internship.find().sort({ createdAt: -1 });
        res.status(200).json(internships);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get active internships only
exports.getActiveInternships = async (req, res) => {
    try {
        const internships = await Internship.find({ status: "Active" }).sort({ createdAt: -1 });
        res.status(200).json(internships);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get internship by ID
exports.getInternshipById = async (req, res) => {
    try {
        const internship = await Internship.findById(req.params.id);

        if (!internship) {
            return res.status(404).json({ message: "Internship not found" });
        }

        res.status(200).json(internship);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update internship (Admin only)
exports.updateInternship = async (req, res) => {
    try {
        const internship = await Internship.findById(req.params.id);

        if (!internship) {
            return res.status(404).json({ message: "Internship not found" });
        }

        const updated = await Internship.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: Date.now() },
            { new: true }
        );

        res.status(200).json({ message: "Internship updated successfully", internship: updated });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete internship (Admin only)
exports.deleteInternship = async (req, res) => {
    try {
        const internship = await Internship.findById(req.params.id);

        if (!internship) {
            return res.status(404).json({ message: "Internship not found" });
        }

        await Internship.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "Internship deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Toggle internship status (Admin only)
exports.toggleInternshipStatus = async (req, res) => {
    try {
        const internship = await Internship.findById(req.params.id);

        if (!internship) {
            return res.status(404).json({ message: "Internship not found" });
        }

        const newStatus = internship.status === "Active" ? "Inactive" : "Active";

        const updated = await Internship.findByIdAndUpdate(
            req.params.id,
            { status: newStatus, updatedAt: Date.now() },
            { new: true }
        );

        res.status(200).json({
            message: `Internship ${newStatus === "Active" ? "activated" : "deactivated"} successfully`,
            internship: updated
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
