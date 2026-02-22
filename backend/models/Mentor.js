// backend/models/Mentor.js
/**
 * Mentor Model
 * Extends from User collection
 */

import mongoose from "mongoose";

const mentorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    expertise: {
      type: [String],
      required: [true, "Expertise is required"],
      minlength: [1, "At least one expertise is required"],
      maxlength: [10, "Maximum 10 expertise items allowed"],
    },
    bio: {
      type: String,
      maxlength: [500, "Bio cannot exceed 500 characters"],
    },
    track: {
      type: String,
      enum: [
        "tech",
        "design",
        "business",
        "sales",
        "marketing",
        "hr",
        "education",
        "startup",
        "social",
        "economics",
      ],
      required: true,
    },
    maxMentees: {
      type: Number,
      required: [true, "Max mentees is required"],
      min: [1, "Max mentees must be at least 1"],
      max: [100, "Max mentees cannot exceed 100"],
    },
    mentees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Mentee",
      },
    ],
    groups: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
      },
    ],
    mentorshipType: {
      type: String,
      enum: ["GROUP", "ONE_ON_ONE"],
      default: "GROUP",
    },
    duration: {
      type: String,
      enum: ["SHORT_TERM", "LONG_TERM", "MEDIUM_TERM"],
      default: "LONG_TERM",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    reviews: [
      {
        menteeId: mongoose.Schema.Types.ObjectId,
        rating: Number,
        comment: String,
        createdAt: Date,
      },
    ],
  },
  {
    timestamps: true,
    collection: "mentors",
  }
);

// Index for better queries
mentorSchema.index({ userId: 1 });
mentorSchema.index({ track: 1 });
mentorSchema.index({ expertise: 1 });

// Populate user data when fetching mentor
mentorSchema.pre(["find", "findOne"], function () {
  this.populate("userId", "email name avatar");
});

export default mongoose.model("Mentor", mentorSchema); 