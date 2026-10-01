import mongoose from 'mongoose';
import MentorProfile from '../models/MentorProfile.js';
import MenteeProfile from '../models/MenteeProfile.js';

function useDb() {
  return mongoose.connection.readyState === 1;
}

async function findProfile(Model, { userId, email }) {
  const ors = [];
  if (userId) ors.push({ userId });
  if (email) ors.push({ email });
  if (!ors.length || !useDb()) return null;
  const doc = await Model.findOne({ $or: ors }).lean();
  return doc ? String(doc._id) : null;
}

/** CRM identity for the authenticated user. Cached on the request. */
export async function loadActor(req) {
  if (req.actor) return req.actor;
  const user = req.user;
  if (!user) return null;

  const email = String(user.email || '').toLowerCase().trim();
  const userId = String(user.userId || user._id || '');
  const role = user.role || 'user';

  let mentorId = null;
  let menteeId = null;
  if (role === 'mentor') {
    mentorId = await findProfile(MentorProfile, { userId, email });
  } else if (role === 'mentee') {
    menteeId = await findProfile(MenteeProfile, { userId, email });
  }

  req.actor = {
    userId,
    email,
    role,
    isAdmin: role === 'admin',
    mentorId,
    menteeId,
  };
  return req.actor;
}
