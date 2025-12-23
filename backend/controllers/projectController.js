const Project = require("../models/Project");

// Create project (Admin only)
exports.createProject = async (req, res) => {
    const { title, description, requirements, tasks, deliverables, deadline, mentor, mentorEmail, projectType, maxGroupSize, skills, status, attachments, maxScore, passingScore } = req.body;

    if (!title || !description || !mentor || !deadline) {
        return res.status(400).json({ message: "Title, description, mentor, and deadline are required" });
    }

    try {
        const project = await Project.create({
            title,
            description,
            requirements,
            tasks: tasks || [],
            deliverables: deliverables || [],
            deadline,
            mentor,
            mentorEmail,
            projectType: projectType || "individual",
            maxGroupSize: maxGroupSize || 1,
            skills: skills || [],
            status: status || "Active",
            attachments: attachments || [],
            maxScore: maxScore || 100,
            passingScore: passingScore || 40,
            createdBy: req.user?.id
        });

        res.status(201).json({
            message: "Project created successfully",
            project
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get all projects
exports.getAllProjects = async (req, res) => {
    try {
        const projects = await Project.find().sort({ createdAt: -1 });
        res.status(200).json(projects);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get active projects only
exports.getActiveProjects = async (req, res) => {
    try {
        const projects = await Project.find({ status: "Active" }).sort({ createdAt: -1 });
        res.status(200).json(projects);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get project by ID
exports.getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        res.status(200).json(project);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update project (Admin only)
exports.updateProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        const updated = await Project.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: Date.now() },
            { new: true }
        );

        res.status(200).json({ message: "Project updated successfully", project: updated });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete project (Admin only)
exports.deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        await Project.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "Project deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Toggle project status (Admin only)
exports.toggleProjectStatus = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        const newStatus = project.status === "Active" ? "Inactive" : "Active";

        const updated = await Project.findByIdAndUpdate(
            req.params.id,
            { status: newStatus, updatedAt: Date.now() },
            { new: true }
        );

        res.status(200).json({
            message: `Project ${newStatus === "Active" ? "activated" : "deactivated"} successfully`,
            project: updated
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
