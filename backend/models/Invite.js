import mongoose from 'mongoose';

const inviteSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    role: { type: String, enum: ['mentor', 'mentee', 'admin'], required: true },
    usedAt: { type: Date, default: null },
    createdBy: { type: String, default: null },
  },
  { timestamps: true }
);

inviteSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    ret._id = ret._id?.toString();
    ret.createdAt = ret.createdAt?.toISOString?.() ?? ret.createdAt;
    ret.usedAt = ret.usedAt?.toISOString?.() ?? ret.usedAt;
    return ret;
  },
});

export default mongoose.models.Invite || mongoose.model('Invite', inviteSchema);
