import MentorProfile from '../models/MentorProfile.js';
import MenteeProfile from '../models/MenteeProfile.js';
import { listMentors } from '../services/mentorStore.js';
import { listMentees } from '../services/menteeStore.js';
import { useDb } from './dataMode.js';

async function findLinkedId(Model, listFn, { userId, email }) {
  if (useDb()) {
    const ors = [];
    if (userId) ors.push({ userId });
    if (email) ors.push({ email });
    if (!ors.length) return null;
    const doc = await Model.findOne({ $or: ors }).lean();
    return doc ? String(doc._id) : null;
  }

  const list = await listFn();
  const hit = list.find((row) => {
    if (userId && String(row.userId || '') === userId) return true;
    if (email && String(row.email || '').toLowerCase() === email) return true;
    return false;
  });
  return hit ? String(hit._id) : null;
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
    mentorId = await findLinkedId(MentorProfile, listMentors, { userId, email });
  } else if (role === 'mentee') {
    menteeId = await findLinkedId(MenteeProfile, listMentees, { userId, email });
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
