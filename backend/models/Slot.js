import mongoose from 'mongoose';

const slotSchema = new mongoose.Schema(
  {
    mentorId: { type: String, required: true, index: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    duration: { type: Number, default: 60 },
    meetingLink: { type: String, default: '' },
    bookedBy: { type: String, default: null },
    menteeId: { type: String, default: null },
    googleCalendarEventId: { type: String, default: null },
  },
  { timestamps: true }
);

slotSchema.index({ mentorId: 1, date: 1, time: 1 });

slotSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret._id = ret._id?.toString();
    return ret;
  },
});

export default mongoose.models.Slot || mongoose.model('Slot', slotSchema);
