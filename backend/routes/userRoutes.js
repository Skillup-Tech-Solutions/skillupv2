const express = require("express");
const router = express.Router();
const { register, login, verifyOtp, changePassword, forgotPassword, resetPassword } = require("../controllers/userController");
const auth = require("../middleware/auth");
const User = require("../models/User");
const { loginLimiter, forgotPasswordLimiter } = require("../middleware/rateLimit");

/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Create a new user
 *     tags: 
 *        - User
 */
router.post("/register", register);
router.post("/login", loginLimiter, login);
router.post("/verify-otp", verifyOtp);
router.post("/user/change-password", changePassword);

// Forgot Password API
/**
 * @swagger
 * /api/forgot-password:
 *   post:
 *     summary: Send password reset link to email
 *     tags: 
 *        - Password Reset
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *                 description: Email address of the user
 *             required:
 *               - email
 *     responses:
 *       200:
 *         description: Reset link sent to email successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password reset link sent to your email"
 *       400:
 *         description: Invalid email format
 *       404:
 *         description: User not found with this email
 *       500:
 *         description: Server error
 */
router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);

// Reset Password API
/**
 * @swagger
 * /api/reset-password:
 *   post:
 *     summary: Reset password using token
 *     tags: 
 *        - Password Reset
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 example: "abc123def456"
 *                 description: Reset token from email
 *               newPassword:
 *                 type: string
 *                 example: "newSecurePassword123"
 *                 description: New password for the user
 *             required:
 *               - token
 *               - newPassword
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password reset successfully"
 *       400:
 *         description: Invalid or expired token
 *       500:
 *         description: Server error
 */
router.post("/reset-password", resetPassword);

// Public GET routes (no authentication required)
router.get("/users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

router.get("/user/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json(user);
});

router.put("/user/:id", auth, async (req, res) => {
  const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

router.delete("/user/:id", auth, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ msg: "User deleted" });
});

// ===== Token Management Endpoints =====

const jwt = require("jsonwebtoken");
const RefreshToken = require("../models/RefreshToken");
const TokenBlacklist = require("../models/TokenBlacklist");

/**
 * @swagger
 * /api/refresh-token:
 *   post:
 *     summary: Exchange refresh token for new access token
 *     tags:
 *        - Auth
 */
router.post("/refresh-token", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token is required" });
  }

  try {
    // Find valid refresh token
    const tokenDoc = await RefreshToken.findOne({
      token: refreshToken,
      isRevoked: false,
      expiresAt: { $gt: new Date() }
    }).populate("userId");

    if (!tokenDoc) {
      return res.status(401).json({ message: "Invalid or expired refresh token" });
    }

    const user = tokenDoc.userId;
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { email: user.email, name: user.name, id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    console.log(`[Auth] Token refreshed for: ${user.email}`);
    res.json({
      accessToken: accessToken,
      expiresIn: 900, // 15 minutes in seconds
      user: { name: user.name, email: user.email, role: user.role, status: user.status }
    });
  } catch (err) {
    console.error("[Auth] Refresh token error:", err.message);
    res.status(500).json({ message: "An error occurred" });
  }
});

/**
 * @swagger
 * /api/logout:
 *   post:
 *     summary: Logout user and invalidate tokens
 *     tags:
 *        - Auth
 */
router.post("/logout", auth, async (req, res) => {
  const { refreshToken } = req.body;
  const accessToken = req.header("Authorization")?.replace("Bearer ", "");

  try {
    // Revoke refresh token if provided
    if (refreshToken) {
      await RefreshToken.updateOne(
        { token: refreshToken },
        { isRevoked: true }
      );
    }

    // Blacklist current access token
    if (accessToken && req.user) {
      // Decode token to get expiry time
      const decoded = jwt.decode(accessToken);
      if (decoded && decoded.exp) {
        await TokenBlacklist.create({
          token: accessToken,
          userId: req.user.id,
          reason: "logout",
          expiresAt: new Date(decoded.exp * 1000)
        });
      }
    }

    // Optionally: Revoke all refresh tokens for this user
    // await RefreshToken.updateMany({ userId: req.user.id }, { isRevoked: true });

    console.log(`[Auth] User logged out: ${req.user?.email}`);
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("[Auth] Logout error:", err.message);
    res.status(500).json({ message: "An error occurred during logout" });
  }
});

module.exports = router;

