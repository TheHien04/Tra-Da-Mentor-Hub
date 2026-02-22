// backend/models/User.js
/**
 * User Model
 * Base user for authentication
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Invalid email format",
      ],
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Don't return password by default
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    role: {
      type: String,
      enum: ["user", "mentor", "mentee", "admin"],
      default: "user",
    },
    avatar: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      default: null,
    },
    emailVerificationExpires: {
      type: Date,
      default: null,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
    googleId: {
      type: String,
      default: null,
    },
    googleCalendarTokens: {
      type: Object,
      default: null,
    },
    subscription: {
      plan: {
        type: String,
        enum: ['free', 'pro', 'premium'],
        default: 'free',
      },
      status: {
        type: String,
        enum: ['active', 'cancelled', 'past_due'],
        default: 'active',
      },
      stripeCustomerId: String,
      stripeSubscriptionId: String,
      startedAt: Date,
      endedAt: Date,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    refreshTokens: [
      {
        token: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
    collection: "users",
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to return safe user object (without password)
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.refreshTokens;
  return user;
};

/**
 * Instance method: Update last login timestamp
 */
userSchema.methods.updateLastLogin = async function () {
  this.lastLogin = new Date();
  await this.save({ validateBeforeSave: false });
};

/**
 * Instance method: Add refresh token
 * @param {string} token - Refresh token to store
 */
userSchema.methods.addRefreshToken = async function (token) {
  this.refreshTokens.push({ token, createdAt: new Date() });
  
  // Keep only last 5 refresh tokens
  if (this.refreshTokens.length > 5) {
    this.refreshTokens = this.refreshTokens.slice(-5);
  }
  
  await this.save({ validateBeforeSave: false });
};

/**
 * Instance method: Remove refresh token (logout)
 * @param {string} token - Refresh token to remove
 */
userSchema.methods.removeRefreshToken = async function (token) {
  this.refreshTokens = this.refreshTokens.filter((rt) => rt.token !== token);
  await this.save({ validateBeforeSave: false });
};

/**
 * Static method: Find user by email with password field
 * @param {string} email - User email
 * @returns {Promise<User>} - User with password field
 */
userSchema.statics.findByEmailWithPassword = function (email) {
  return this.findOne({ email }).select('+password');
};

/**
 * Instance method: Generate email verification token
 */
userSchema.methods.generateEmailVerificationToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = token;
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return token;
};

/**
 * Instance method: Generate password reset token
 */
userSchema.methods.generatePasswordResetToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = token;
  this.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  return token;
};

export default mongoose.model("User", userSchema);
