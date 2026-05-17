import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema(
  {
    menteeName: { type: String, required: true, trim: true },
    mentorName: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    track: {
      type: String,
      enum: ['career', 'personal', 'soft_skills'],
      default: 'career',
    },
    status: {
      type: String,
      enum: ['PUBLISHED', 'PENDING', 'REJECTED'],
      default: 'PENDING',
      index: true,
    },
    date: { type: String, default: () => new Date().toISOString().split('T')[0] },
  },
  { timestamps: true }
);

testimonialSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret._id = ret._id?.toString();
    return ret;
  },
});

export default mongoose.models.Testimonial ||
  mongoose.model('Testimonial', testimonialSchema);
