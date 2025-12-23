const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { validateName, validateEmail, validateMobile, validatePassword } = require("../utils/validation");

// Student Self Signup
exports.signup = async (req, res, next) => {
    const { name, email, mobile, password } = req.body;

    // Validation
    const nameError = validateName(name);
    if (nameError) return res.status(400).json({ message: nameError });

    const emailError = validateEmail(email);
    if (emailError) return res.status(400).json({ message: emailError });

    const mobileError = validateMobile(mobile);
    if (mobileError) return res.status(400).json({ message: mobileError });

    const passwordError = validatePassword(password);
    if (passwordError) return res.status(400).json({ message: passwordError });

    try {
        const userExist = await User.findOne({ email });
        if (userExist) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const student = await User.create({
            name,
            email,
            mobile,
            password: hashedPassword,
            role: "student",
            status: "Self-Signed"
        });

        res.status(201).json({
            message: "Registration successful. You can now login.",
            student: {
                _id: student._id,
                name: student.name,
                email: student.email,
                role: student.role,
                status: student.status
            }
        });
    } catch (err) {
        next(err);
    }
};

// Activate Account (from invite link)
exports.activate = async (req, res, next) => {
    const { token, password } = req.body;

    if (!token || !password) {
        return res.status(400).json({ message: "Token and password are required" });
    }

    const passwordError = validatePassword(password);
    if (passwordError) return res.status(400).json({ message: passwordError });

    try {
        const user = await User.findOne({
            inviteToken: token,
            inviteTokenExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired activation link" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.findByIdAndUpdate(user._id, {
            password: hashedPassword,
            status: "Active",
            inviteToken: undefined,
            inviteTokenExpires: undefined,
            updatedAt: Date.now()
        });

        res.status(200).json({ message: "Account activated successfully. You can now login." });
    } catch (err) {
        next(err);
    }
};

// Validate activation token
exports.validateToken = async (req, res, next) => {
    try {
        const user = await User.findOne({
            inviteToken: req.params.token,
            inviteTokenExpires: { $gt: Date.now() }
        }).select("name email");

        if (!user) {
            return res.status(400).json({ valid: false, message: "Invalid or expired activation link" });
        }

        res.status(200).json({ valid: true, user: { name: user.name, email: user.email } });
    } catch (err) {
        next(err);
    }
};
