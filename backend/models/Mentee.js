import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const MenteeSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String
  },
  track: {
    type: String,
    enum: ['tech', 'economics', 'marketing', 'hr', 'sales', 'social', 'business', 'education', 'startup', 'design'],
    default: 'tech'
  },
  goals: {
    type: [String]
  },
  progress: {
    type: String,
    enum: ['Mới bắt đầu', 'Đang tiến triển', 'Hoàn thành'],
    default: 'Mới bắt đầu'
  },
  notes: {
    type: String
  },
  // Reference to mentor responsible for this mentee
  mentor: {
    type: Schema.Types.ObjectId,
    ref: 'Mentor'
  },
  // Reference to group this mentee belongs to
  group: {
    type: Schema.Types.ObjectId,
    ref: 'Group'
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  lastMeetingDate: {
    type: Date
  },
  nextMeetingDate: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Mentee = mongoose.model('Mentee', MenteeSchema);
export default Mentee; 