import mongoose from 'mongoose';

const sessionLogSchema = new mongoose.Schema(
  {
    mentorId: { type: String, required: true, index: true },
    menteeId: { type: String, required: true, index: true },
    sessionDate: { type: Date, required: true },
    topic: { type: String, required: true, trim: true },
    mentorScore: { type: Number, min: 1, max: 5, default: null },
    menteeScore: { type: Number, min: 1, max: 5, default: null },
    mentorNeedsSupport: { type: Boolean, default: false },
    mentorSupportReason: { type: String, default: null },
    menteeNeedsSupport: { type: Boolean, default: false },
    menteeSupportReason: { type: String, default: null },
    completedByMentor: { type: Boolean, default: false },
    completedByMentee: { type: Boolean, default: false },
  },
  { timestamps: true }
);

sessionLogSchema.index({ mentorId: 1, menteeId: 1, sessionDate: 1 });

sessionLogSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret._id = ret._id?.toString();
    if (ret.sessionDate instanceof Date) {
      ret.sessionDate = ret.sessionDate.toISOString();
    }
    return ret;
  },
});

export default mongoose.models.SessionLog ||
  mongoose.model('SessionLog', sessionLogSchema);
