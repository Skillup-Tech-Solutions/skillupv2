const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  mobile: { type: String, required: true },
  role: {
    type: String,
    enum: ["admin", "student", "employee"],
    default: "student",
    required: true
  },
  status: {
    type: String,
    enum: ["Created", "Self-Signed", "Invited", "Active", "Suspended", "Deleted"],
    default: "Created"
  },
  inviteToken: { type: String },
  inviteTokenExpires: { type: Date },
  resetPasswordExpires: { type: Date },
  isForgot: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
userSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ inviteToken: 1 });

module.exports = mongoose.model("User", userSchema);

