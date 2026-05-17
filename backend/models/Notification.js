import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, default: '' },
    type: { type: String, enum: ['info', 'success', 'warning', 'error'], default: 'info' },
    href: { type: String, default: null },
    read: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

notificationSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    ret._id = ret._id?.toString();
    ret.createdAt = ret.createdAt?.toISOString?.() ?? ret.createdAt;
    return ret;
  },
});

export default mongoose.models.Notification ||
  mongoose.model('Notification', notificationSchema);
