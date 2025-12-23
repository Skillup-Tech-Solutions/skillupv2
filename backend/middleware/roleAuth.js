const roleAuth = {
    // Middleware to check if user is admin
    adminOnly: (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Authentication required" });
        }

        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Access Denied. Admin only." });
        }

        next();
    },

    // Middleware to check if user is student
    studentOnly: (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Authentication required" });
        }

        if (req.user.role !== "student") {
            return res.status(403).json({ message: "Access Denied. Students only." });
        }

        next();
    },

    // Middleware to check if user is either admin or the student themselves
    adminOrSelf: (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Authentication required" });
        }

        const requestedUserId = req.params.id || req.params.studentId;

        if (req.user.role === "admin" || req.user.id === requestedUserId) {
            return next();
        }

        return res.status(403).json({ message: "Access Denied." });
    }
};

module.exports = roleAuth;
