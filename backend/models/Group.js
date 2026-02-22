// backend/models/Group.js
/**
 * Group Model
 * Study/mentoring groups
 */

import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Group name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    topic: {
      type: String,
      required: [true, "Topic is required"],
    },
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mentor",
      required: true,
    },
    mentees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Mentee",
      },
    ],
    maxCapacity: {
      type: Number,
      required: [true, "Max capacity is required"],
      min: [1, "Max capacity must be at least 1"],
    },
    meetingSchedule: {
      frequency: {
        type: String,
        enum: ["Weekly", "Bi-weekly", "Monthly"],
        default: "Weekly",
      },
      dayOfWeek: String,
      time: String, // HH:MM format
    },
    status: {
      type: String,
      enum: ["ACTIVE", "ARCHIVED", "CLOSED"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
    collection: "groups",
  }
);

// Index
groupSchema.index({ mentorId: 1 });
groupSchema.index({ status: 1 });

// Populate
groupSchema.pre(["find", "findOne"], function () {
  this.populate("mentorId", "expertise track");
  this.populate("mentees", "progress track");
});

export default mongoose.model("Group", groupSchema); 