import mongoose from 'mongoose';

const activityRecordSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    type: { type: String, required: true, index: true },
    actor: {
      id: { type: String, default: '' },
      name: { type: String, default: '' },
      avatar: { type: String, default: '' },
    },
    action: { type: String, default: '' },
    target: { type: String, default: '' },
    description: { type: String, default: '' },
    message: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { versionKey: false }
);

activityRecordSchema.set('toJSON', {
  transform: (_doc, ret) => {
    if (ret._id) ret._id = String(ret._id);
    return ret;
  },
});

export default mongoose.models.ActivityRecord ||
  mongoose.model('ActivityRecord', activityRecordSchema, 'activity_records');
