// # JWT middleware 

const jwt = require("jsonwebtoken");
const TokenBlacklist = require("../models/TokenBlacklist");

const auth = async (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(401).json({ message: "Authentication required" });
  }

  // Extract token from "Bearer <token>" format
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    // Check if token is blacklisted (logged out)
    const blacklisted = await TokenBlacklist.findOne({ token });
    if (blacklisted) {
      console.warn(`[Auth] Attempted use of blacklisted token`);
      return res.status(401).json({ message: "Session has been invalidated. Please login again." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    // Log for monitoring but don't expose details to client
    console.warn(`[Auth] Token verification failed: ${err.message}`);

    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Session expired. Please login again." });
    }

    return res.status(401).json({ message: "Invalid authentication token" });
  }
};

module.exports = auth;
