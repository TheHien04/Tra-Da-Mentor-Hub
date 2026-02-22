// backend/models/SessionLog.js
/**
 * Session Log – CRM ghi nhận sau mỗi buổi mentoring (flow)
 * Mentor & Mentee điền: ngày, chủ đề, điểm 1–5, có cần hỗ trợ không
 */

import mongoose from "mongoose";

const sessionLogSchema = new mongoose.Schema(
  {
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mentor",
      required: true,
    },
    menteeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mentee",
      required: true,
    },
    sessionDate: {
      type: Date,
      required: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, "Topic cannot exceed 500 characters"],
    },
    // Điểm 1–5 (mentor điền)
    mentorScore: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    // Điểm 1–5 (mentee điền)
    menteeScore: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    // Có cần team product hỗ trợ không? (mentor)
    mentorNeedsSupport: {
      type: Boolean,
      default: false,
    },
    mentorSupportReason: {
      type: String,
      default: null,
      trim: true,
      maxlength: [1000, "Reason cannot exceed 1000 characters"],
    },
    // Có cần team product hỗ trợ không? (mentee)
    menteeNeedsSupport: {
      type: Boolean,
      default: false,
    },
    menteeSupportReason: {
      type: String,
      default: null,
      trim: true,
      maxlength: [1000, "Reason cannot exceed 1000 characters"],
    },
    // Đã điền log chưa (để pop-up “điền xong mới kết thúc meeting”)
    completedByMentor: { type: Boolean, default: false },
    completedByMentee: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    collection: "sessionlogs",
  }
);

sessionLogSchema.index({ mentorId: 1, sessionDate: 1 });
sessionLogSchema.index({ menteeId: 1, sessionDate: 1 });
sessionLogSchema.index({ mentorId: 1, menteeId: 1, sessionDate: 1 }, { unique: true });

sessionLogSchema.pre(["find", "findOne"], function () {
  this.populate("mentorId", "userId expertise track");
  this.populate("menteeId", "userId school track");
});

export default mongoose.model("SessionLog", sessionLogSchema);
