//   # MongoDB connection 
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI environment variable is not defined");
    }

    await mongoose.connect(process.env.MONGO_URI, {
      // Connection pool settings
      maxPoolSize: 10,          // Maximum connections in the pool
      minPoolSize: 2,           // Minimum connections to maintain
      // Timeout settings
      serverSelectionTimeoutMS: 5000,  // How long to try selecting a server
      socketTimeoutMS: 45000,          // How long a socket can be inactive
      // Performance settings
      maxIdleTimeMS: 30000,     // Close idle connections after 30s
    });

    console.log("MongoDB connected successfully");
    console.log("Database:", mongoose.connection.name);
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    console.error("Make sure MONGO_URI is set correctly in environment variables");
    process.exit(1);
  }
};

module.exports = connectDB;

