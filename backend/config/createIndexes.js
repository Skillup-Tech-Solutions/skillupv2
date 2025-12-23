/**
 * Database Indexes Script
 * Run once to create indexes for better query performance
 * 
 * Usage: node config/createIndexes.js
 */

const mongoose = require("mongoose");
require("dotenv").config();

const createIndexes = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected. Creating indexes...\n");

        // StudentAssignment indexes - most frequently queried collection
        const StudentAssignment = require("../models/StudentAssignment");
        await StudentAssignment.collection.createIndex({ student: 1 });
        await StudentAssignment.collection.createIndex({ itemType: 1 });
        await StudentAssignment.collection.createIndex({ student: 1, itemType: 1 });
        await StudentAssignment.collection.createIndex({ itemId: 1 });
        await StudentAssignment.collection.createIndex({ status: 1 });
        console.log("✓ StudentAssignment indexes created");

        // User indexes
        const User = require("../models/User");
        await User.collection.createIndex({ email: 1 }, { unique: true });
        await User.collection.createIndex({ role: 1 });
        await User.collection.createIndex({ status: 1 });
        console.log("✓ User indexes created");

        // Announcement indexes
        const Announcement = require("../models/Announcement");
        await Announcement.collection.createIndex({ isActive: 1 });
        await Announcement.collection.createIndex({ targetAudience: 1 });
        await Announcement.collection.createIndex({ isActive: 1, targetAudience: 1 });
        console.log("✓ Announcement indexes created");

        // Course indexes
        const Course = require("../models/Course");
        await Course.collection.createIndex({ status: 1 });
        await Course.collection.createIndex({ category: 1 });
        console.log("✓ Course indexes created");

        // Submission indexes
        const Submission = require("../models/Submission");
        await Submission.collection.createIndex({ student: 1 });
        await Submission.collection.createIndex({ assignment: 1 });
        console.log("✓ Submission indexes created");

        console.log("\n✅ All indexes created successfully!");

        // List all indexes
        console.log("\n--- Index Summary ---");
        const collections = ["studentassignments", "users", "announcements", "courses", "submissions"];
        for (const col of collections) {
            try {
                const indexes = await mongoose.connection.db.collection(col).indexes();
                console.log(`\n${col}:`, indexes.map(i => i.name).join(", "));
            } catch (e) {
                // Collection might not exist yet
            }
        }

    } catch (err) {
        console.error("Error creating indexes:", err.message);
    } finally {
        await mongoose.disconnect();
        console.log("\nDisconnected from MongoDB.");
    }
};

createIndexes();
