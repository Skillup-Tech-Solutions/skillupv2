const StudentAssignment = require("../models/StudentAssignment");
const User = require("../models/User");
const Course = require("../models/Course");
const Internship = require("../models/Internship");
const Project = require("../models/Project");

// Get model name from item type
const getModelName = (itemType) => {
    const modelMap = {
        "course": "Course",
        "internship": "Internship",
        "project": "Project"
    };
    return modelMap[itemType];
};

// Get model from item type
const getModel = (itemType) => {
    const modelMap = {
        "course": Course,
        "internship": Internship,
        "project": Project
    };
    return modelMap[itemType];
};

const sendProjectEmail = require("../utils/sendProjectMail");
const sendCourseMail = require("../utils/sendCourseMail");

// Assign item to student (Admin only)
exports.assignToStudent = async (req, res) => {
    const { studentId, itemType, itemId } = req.body;

    if (!studentId || !itemType || !itemId) {
        return res.status(400).json({ message: "Student ID, item type, and item ID are required" });
    }

    if (!["course", "internship", "project"].includes(itemType)) {
        return res.status(400).json({ message: "Invalid item type. Must be course, internship, or project" });
    }

    try {
        // Check if student exists
        const student = await User.findOne({ _id: studentId, role: "student" });
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Check if item exists
        const Model = getModel(itemType);
        const item = await Model.findById(itemId);
        if (!item) {
            return res.status(404).json({ message: `${itemType} not found` });
        }

        // Check if assignment already exists
        const existingAssignment = await StudentAssignment.findOne({
            student: studentId,
            itemId: itemId
        });
        if (existingAssignment) {
            return res.status(400).json({ message: `${itemType} already assigned to this student` });
        }

        // Create assignment
        const assignment = await StudentAssignment.create({
            student: studentId,
            itemType,
            itemId,
            itemModel: getModelName(itemType),
            progress: 0,
            status: "assigned",
            assignedBy: req.user.id
        });

        // Send Welcome Email if itemType is "course"
        if (itemType === "course") {
            const course = await Course.findById(itemId);
            await sendCourseMail("COURSE_WELCOME", {
                name: student.name,
                email: student.email
            }, {
                courseName: course.name,
                courseId: course._id,
                startDate: course.startDate,
                endDate: course.endDate,
                timing: course.timing
            });
        }

        res.status(201).json({
            message: `${itemType} assigned successfully`,
            assignment
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Bulk assign items to student (Admin only)
exports.bulkAssignToStudent = async (req, res) => {
    const { studentId, assignments } = req.body;

    if (!studentId || !assignments || !Array.isArray(assignments)) {
        return res.status(400).json({ message: "Student ID and assignments array are required" });
    }

    try {
        // Check if student exists
        const student = await User.findOne({ _id: studentId, role: "student" });
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        const results = [];
        const errors = [];

        for (const { itemType, itemId } of assignments) {
            try {
                // Check if item exists
                const Model = getModel(itemType);
                const item = await Model.findById(itemId);
                if (!item) {
                    errors.push({ itemType, itemId, error: `${itemType} not found` });
                    continue;
                }

                // Check if assignment already exists
                const existingAssignment = await StudentAssignment.findOne({
                    student: studentId,
                    itemId: itemId
                });
                if (existingAssignment) {
                    errors.push({ itemType, itemId, error: `Already assigned` });
                    continue;
                }

                // Create assignment
                const assignment = await StudentAssignment.create({
                    student: studentId,
                    itemType,
                    itemId,
                    itemModel: getModelName(itemType),
                    progress: 0,
                    status: "assigned",
                    assignedBy: req.user.id
                });

                // Send Welcome Email if itemType is "course"
                if (itemType === "course") {
                    const course = await Course.findById(itemId);
                    // Don't await email in loop to speed up bulk assignment, or use Promise.all later
                    // Using await here for safety to ensure email is sent
                    await sendCourseMail("COURSE_WELCOME", {
                        name: student.name,
                        email: student.email
                    }, {
                        courseName: course.name,
                        courseId: course._id,
                        startDate: course.startDate,
                        endDate: course.endDate,
                        timing: course.timing
                    });
                }

                results.push(assignment);
            } catch (err) {
                errors.push({ itemType, itemId, error: err.message });
            }
        }

        res.status(201).json({
            message: `${results.length} items assigned successfully`,
            successful: results,
            failed: errors
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Remove assignment (Admin only)
exports.removeAssignment = async (req, res) => {
    try {
        const assignment = await StudentAssignment.findById(req.params.id);

        if (!assignment) {
            return res.status(404).json({ message: "Assignment not found" });
        }

        await StudentAssignment.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "Assignment removed successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update student progress on assignment (Admin only)
exports.updateProgress = async (req, res) => {
    const { progress, status } = req.body;

    try {
        const assignment = await StudentAssignment.findById(req.params.id);

        if (!assignment) {
            return res.status(404).json({ message: "Assignment not found" });
        }

        const updateData = { progress };

        if (status) {
            updateData.status = status;
        }

        if (progress === 100 || status === "completed") {
            updateData.status = "completed";
            updateData.completedAt = Date.now();
        }

        const updatedAssignment = await StudentAssignment.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        res.status(200).json({
            message: "Progress updated successfully",
            assignment: updatedAssignment
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get all assignments for a student (Admin only)
exports.getStudentAssignments = async (req, res) => {
    try {
        // Support both /students/:id/assignments and /assignments/student/:studentId
        const studentId = req.params.studentId || req.params.id;

        // Check if student exists
        const student = await User.findOne({ _id: studentId, role: "student" });
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        const assignments = await StudentAssignment.find({ student: studentId })
            .populate('itemId')
            .populate('assignedBy', 'name email')
            .sort({ assignedAt: -1 });

        // Group by type
        const grouped = {
            courses: assignments.filter(a => a.itemType === "course"),
            internships: assignments.filter(a => a.itemType === "internship"),
            projects: assignments.filter(a => a.itemType === "project")
        };

        res.status(200).json({ assignments, grouped });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get all assignments (Admin only)
exports.getAllAssignments = async (req, res) => {
    try {
        const { itemType, status } = req.query;

        const query = {};
        if (itemType) query.itemType = itemType;
        if (status) query.status = status;

        const assignments = await StudentAssignment.find(query)
            .populate('student', 'name email')
            .populate('itemId')
            .populate('assignedBy', 'name email')
            .sort({ assignedAt: -1 });

        res.status(200).json(assignments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
