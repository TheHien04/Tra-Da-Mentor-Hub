import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const GroupSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  // Reference to mentor who manages this group
  mentor: {
    type: Schema.Types.ObjectId,
    ref: 'Mentor'
  },
  // Reference to mentees in this group
  mentees: [{
    type: Schema.Types.ObjectId,
    ref: 'Mentee'
  }],
  maxSize: {
    type: Number,
    default: 10
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  // Group meetings schedule
  meetingSchedule: {
    frequency: {
      type: String,
      enum: ['weekly', 'biweekly', 'monthly'],
      default: 'weekly'
    },
    dayOfWeek: {
      type: Number // 0-6 (Sunday to Saturday)
    },
    time: {
      type: String // Format: "HH:MM"
    }
  }
});

const Group = mongoose.model('Group', GroupSchema);
export default Group; 