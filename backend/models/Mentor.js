import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const MentorSchema = new Schema({
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
  bio: {
    type: String
  },
  track: {
    type: String,
    enum: ['tech', 'economics', 'marketing', 'hr', 'sales', 'social', 'business', 'education', 'startup', 'design'],
    default: 'tech'
  },
  expertise: {
    type: [String]
  },
  maxMentees: {
    type: Number,
    default: 10
  },
  // Reference to mentees this mentor is responsible for
  mentees: [{
    type: Schema.Types.ObjectId,
    ref: 'Mentee'
  }],
  // Reference to groups managed by this mentor
  groups: [{
    type: Schema.Types.ObjectId,
    ref: 'Group'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Mentor = mongoose.model('Mentor', MentorSchema);
export default Mentor; 