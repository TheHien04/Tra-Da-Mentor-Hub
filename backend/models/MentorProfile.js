import mongoose from 'mongoose';

const mentorProfileSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, default: '' },
    track: { type: String, required: true },
    bio: { type: String, default: '' },
    expertise: { type: [String], default: [] },
    maxMentees: { type: Number, default: 5 },
    mentees: { type: [String], default: [] },
    groups: { type: [String], default: [] },
    mentorshipType: { type: String, enum: ['GROUP', 'ONE_ON_ONE'], default: 'GROUP' },
    duration: {
      type: String,
      enum: ['SHORT_TERM', 'LONG_TERM', 'MEDIUM_TERM'],
      default: 'LONG_TERM',
    },
    avatarUrl: { type: String, default: '' },
  },
  { timestamps: true, versionKey: false }
);

mentorProfileSchema.set('toJSON', {
  transform: (_doc, ret) => {
    if (ret._id) ret._id = String(ret._id);
    if (ret.createdAt instanceof Date) ret.createdAt = ret.createdAt;
    if (ret.updatedAt instanceof Date) ret.updatedAt = ret.updatedAt;
    return ret;
  },
});

export default mongoose.models.MentorProfile ||
  mongoose.model('MentorProfile', mentorProfileSchema, 'mentor_profiles');
