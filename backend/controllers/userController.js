const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendOtpEmail = require("../utils/sendOtpMail");
const sendPasswordMail = require("../utils/sendPasswordMail");
const { sendResetPasswordMail } = require("../utils/sendResetMail");
const { validateName, validateEmail, validateMobile } = require("../utils/validation");

const otpStore = new Map();

exports.register = async (req, res) => {
  const { name, email, mobile } = req.body;

  const nameError = validateName(name);
  if (nameError) return res.status(400).json({ message: nameError });

  const emailError = validateEmail(email);
  if (emailError) return res.status(400).json({ message: emailError });

  const mobileError = validateMobile(mobile);
  if (mobileError) return res.status(400).json({ message: mobileError });

  try {
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({ message: "User already exists" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const expiresAt = Date.now() + 60 * 1000; // 1 minute expiry

    otpStore.set(email, { name, email, mobile, otp, expiresAt });

    // OTP sent - not logged for security
    await sendOtpEmail(email, otp);

    res.status(200).json({ message: "OTP sent to your email" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// ---- 
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore.get(email);

  if (!record) return res.status(400).json({ message: "OTP not found" });
  if (Date.now() > record.expiresAt) {
    otpStore.delete(email);
    return res.status(400).json({ message: "OTP expired" });
  }
  if (parseInt(otp) !== record.otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  const randomPassword = Math.random().toString(36).slice(-8);
  const hashedPassword = await bcrypt.hash(randomPassword, 10);

  const user = await User.create({
    name: record.name,
    email: record.email,
    mobile: record.mobile,
    password: hashedPassword,
    status: "Active",
    role: "user",
  });
  await sendPasswordMail(email, record.name, randomPassword);
  otpStore.delete(email);
  res.status(201).json({ message: "User registered and password sent to email" });
};

// Failed login attempt tracking (in-memory, keyed by email)
const failedLoginAttempts = new Map();
const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

// Helper to check if account is locked
const isAccountLocked = (email) => {
  const attempts = failedLoginAttempts.get(email);
  if (!attempts) return false;

  if (attempts.count >= LOCKOUT_THRESHOLD) {
    const lockoutEnds = attempts.lastAttempt + LOCKOUT_DURATION;
    if (Date.now() < lockoutEnds) {
      return true;
    }
    // Lockout expired, reset attempts
    failedLoginAttempts.delete(email);
  }
  return false;
};

// Record failed login attempt
const recordFailedAttempt = (email) => {
  const attempts = failedLoginAttempts.get(email) || { count: 0, lastAttempt: 0 };
  attempts.count += 1;
  attempts.lastAttempt = Date.now();
  failedLoginAttempts.set(email, attempts);
  return attempts.count;
};

// Clear failed attempts on successful login
const clearFailedAttempts = (email) => {
  failedLoginAttempts.delete(email);
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // Check if account is locked
    if (isAccountLocked(email)) {
      console.warn(`[Security] Locked account login attempt: ${email}`);
      return res.status(429).json({
        message: "Account temporarily locked due to too many failed attempts. Please try again after 15 minutes."
      });
    }

    const user = await User.findOne({ email });

    // Use same error message for invalid email/password to prevent enumeration
    if (!user) {
      recordFailedAttempt(email);
      console.warn(`[Security] Failed login - unknown email: ${email}`);
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const attemptCount = recordFailedAttempt(email);
      console.warn(`[Security] Failed login attempt ${attemptCount}/${LOCKOUT_THRESHOLD} for: ${email}`);

      if (attemptCount >= LOCKOUT_THRESHOLD) {
        return res.status(429).json({
          message: "Account temporarily locked due to too many failed attempts. Please try again after 15 minutes."
        });
      }

      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Successful login - clear failed attempts
    clearFailedAttempts(email);

    // Generate access token (15 minutes)
    const accessToken = jwt.sign(
      { email: user.email, name: user.name, id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // Generate refresh token (7 days)
    const refreshToken = crypto.randomBytes(64).toString('hex');
    const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Store refresh token in database
    const RefreshToken = require("../models/RefreshToken");
    await RefreshToken.create({
      token: refreshToken,
      userId: user._id,
      userAgent: req.headers['user-agent'] || '',
      ipAddress: req.ip || req.connection?.remoteAddress || '',
      expiresAt: refreshTokenExpiry
    });

    console.log(`[Auth] Successful login: ${email}`);
    res.json({
      accessToken: accessToken,
      refreshToken: refreshToken,
      expiresIn: 900, // 15 minutes in seconds
      user: { name: user.name, email: user.email, role: user.role, status: user.status }
    });
  } catch (err) {
    console.error(`[Auth] Login error for ${email}:`, err.message);
    res.status(500).json({ message: "An error occurred during login" });
  }
};



exports.changePassword = async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;

  if (!email || !currentPassword || !newPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===== FORGOT PASSWORD API =====
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  // Validate email
  const emailError = validateEmail(email);
  if (emailError) return res.status(400).json({ message: emailError });

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found with this email" });
    }

    // Generate reset token (encrypt the email with timestamp for security)
    const resetData = `${email}-${Date.now()}`;
    const resetToken = Buffer.from(resetData).toString('base64');
    // Token generated - not logged for security

    // Set expiry time (15 minutes from now)
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Update user with reset token, expiry time, and isForgot flag
    await User.findByIdAndUpdate(user._id, {
      resetPasswordExpires: resetTokenExpiry,
      isForgot: true
    });

    // Create reset link pointing to your frontend
    const frontendResetUrl = `${"https://frontend-admin-panel-ecru.vercel.app/#/reset-password"}?token=${resetToken}`;

    // Send email with reset link
    await sendResetPasswordMail(user.email, user.name, frontendResetUrl);

    res.status(200).json({
      message: "Password reset link sent to your email"
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reset Password with Token
const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required" });
    }

    let email;
    try {
      const decodedData = Buffer.from(token, 'base64').toString('utf-8');
      email = decodedData.split('-')[0];
    } catch (error) {
      return res.status(400).json({ message: "Invalid token format" });
    }
    const user = await User.findOne({
      email: email,
      isForgot: true,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired reset token"
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined,
      isForgot: false,
      updatedAt: new Date()
    });

    res.status(200).json({
      message: "Password reset successfully"
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.resetPassword = resetPassword;