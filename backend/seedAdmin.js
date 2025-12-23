const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const connectDB = require("./config/db");

dotenv.config();

const seedAdmin = async () => {
    try {
        await connectDB();

        const email = "ahamednazeer202@gmail.com";
        const password = "admin123";
        const adminData = {
            name: "Admin User",
            email: email,
            mobile: "1234567890",
            role: "admin",
            status: "Active",
        };

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            console.log("User already exists. Updating to admin role and resetting password...");
            const hashedPassword = await bcrypt.hash(password, 10);
            existingUser.password = hashedPassword;
            existingUser.role = "admin";
            existingUser.status = "Active";
            await existingUser.save();
            console.log("Admin user updated successfully.");
        } else {
            console.log("Creating new admin user...");
            const hashedPassword = await bcrypt.hash(password, 10);
            adminData.password = hashedPassword;
            await User.create(adminData);
            console.log("Admin user created successfully.");
        }

        process.exit(0);
    } catch (error) {
        console.error("Error seeding admin:", error);
        process.exit(1);
    }
};

seedAdmin();
