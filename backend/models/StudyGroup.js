import mongoose from 'mongoose';

const studyGroupSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    topic: { type: String, required: true },
    mentorId: { type: String, required: true },
    mentor: {
      name: { type: String, default: '' },
    },
    mentees: { type: [String], default: [] },
    maxSize: { type: Number, default: 5 },
    meetingSchedule: {
      frequency: { type: String, default: 'Weekly' },
      dayOfWeek: { type: String, default: '' },
      time: { type: String, default: '' },
    },
  },
  { timestamps: true, versionKey: false }
);

studyGroupSchema.set('toJSON', {
  transform: (_doc, ret) => {
    if (ret._id) ret._id = String(ret._id);
    return ret;
  },
});

export default mongoose.models.StudyGroup ||
  mongoose.model('StudyGroup', studyGroupSchema, 'study_groups');
