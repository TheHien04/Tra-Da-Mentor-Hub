// backend/models/Mentee.js
/**
 * Mentee Model
 * Student/trainee being mentored
 */

import mongoose from "mongoose";

const menteeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    school: {
      type: String,
      default: null,
    },
    interests: {
      type: [String],
      default: [],
      maxlength: [10, "Maximum 10 interests allowed"],
    },
    goals: {
      type: [String],
      default: [],
      maxlength: [5, "Maximum 5 goals allowed"],
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
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
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mentor",
      default: null,
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      default: null,
    },
    mentorshipType: {
      type: String,
      enum: ["GROUP", "ONE_ON_ONE"],
      default: "GROUP",
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: null,
    },
    feedback: [
      {
        mentorId: mongoose.Schema.Types.ObjectId,
        feedback: String,
        rating: Number,
        createdAt: Date,
      },
    ],
  },
  {
    timestamps: true,
    collection: "mentees",
  }
);

// Index
menteeSchema.index({ userId: 1 });
menteeSchema.index({ mentorId: 1 });
menteeSchema.index({ groupId: 1 });
menteeSchema.index({ track: 1 });

// Populate references
menteeSchema.pre(["find", "findOne"], function () {
  this.populate("userId", "email name avatar");
  this.populate("mentorId", "expertise track");
  this.populate("groupId", "name");
});

export default mongoose.model("Mentee", menteeSchema); 