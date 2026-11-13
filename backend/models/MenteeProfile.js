import mongoose from 'mongoose';
import { APPLICATION_STATUSES } from '../domain/applicationLifecycle.js';

const menteeProfileSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    userId: { type: String, default: null, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    phone: { type: String, default: '' },
    track: { type: String, required: true },
    school: { type: String, default: '' },
    interests: { type: [String], default: [] },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    mentorId: { type: String, default: null },
    groupId: { type: String, default: null },
    mentorshipType: { type: String, enum: ['GROUP', 'ONE_ON_ONE'], default: 'GROUP' },
    applicationStatus: {
      type: String,
      enum: APPLICATION_STATUSES,
      default: 'pending',
    },
    applicationHistory: {
      type: [
        {
          _id: false,
          from: { type: String, enum: APPLICATION_STATUSES, required: true },
          to: { type: String, enum: APPLICATION_STATUSES, required: true },
          changedAt: { type: Date, required: true },
          actorId: { type: String, default: '' },
          actorRole: { type: String, default: '' },
          reason: { type: String, maxlength: 500, default: '' },
        },
      ],
      default: [],
    },
    goals: { type: [String], default: [] },
    avatarUrl: { type: String, default: '' },
  },
  { timestamps: true, versionKey: false }
);

menteeProfileSchema.set('toJSON', {
  transform: (_doc, ret) => {
    if (ret._id) ret._id = String(ret._id);
    return ret;
  },
});

export { APPLICATION_STATUSES };
export default mongoose.models.MenteeProfile ||
  mongoose.model('MenteeProfile', menteeProfileSchema, 'mentee_profiles');
