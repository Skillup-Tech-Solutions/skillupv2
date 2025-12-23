const Announcement = require("../models/Announcement");

// Create announcement (Admin only)
exports.createAnnouncement = async (req, res) => {
    const { title, content, targetAudience, priority } = req.body;

    if (!title || !content) {
        return res.status(400).json({ message: "Title and content are required" });
    }

    try {
        const announcement = await Announcement.create({
            title,
            content,
            targetAudience: targetAudience || "all",
            priority: priority || "medium",
            createdBy: req.user.id,
            isActive: true
        });

        res.status(201).json({
            message: "Announcement created successfully",
            announcement
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get all announcements (Admin)
exports.getAllAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find()
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });
        res.status(200).json(announcements);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get active announcements (for students)
exports.getActiveAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find({
            isActive: true,
            targetAudience: { $in: ["all", "students"] }
        })
            .populate('createdBy', 'name')
            .sort({ priority: -1, createdAt: -1 });
        res.status(200).json(announcements);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get announcement by ID
exports.getAnnouncementById = async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id)
            .populate('createdBy', 'name email');

        if (!announcement) {
            return res.status(404).json({ message: "Announcement not found" });
        }

        res.status(200).json(announcement);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update announcement (Admin only)
exports.updateAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);

        if (!announcement) {
            return res.status(404).json({ message: "Announcement not found" });
        }

        const updated = await Announcement.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: Date.now() },
            { new: true }
        );

        res.status(200).json({ message: "Announcement updated successfully", announcement: updated });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete announcement (Admin only)
exports.deleteAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);

        if (!announcement) {
            return res.status(404).json({ message: "Announcement not found" });
        }

        await Announcement.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "Announcement deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Toggle announcement active status (Admin only)
exports.toggleAnnouncementStatus = async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);

        if (!announcement) {
            return res.status(404).json({ message: "Announcement not found" });
        }

        const updated = await Announcement.findByIdAndUpdate(
            req.params.id,
            { isActive: !announcement.isActive, updatedAt: Date.now() },
            { new: true }
        );

        res.status(200).json({
            message: `Announcement ${updated.isActive ? "activated" : "deactivated"} successfully`,
            announcement: updated
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
