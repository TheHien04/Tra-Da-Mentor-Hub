import MentorProfile from '../models/MentorProfile.js';
import MenteeProfile from '../models/MenteeProfile.js';
import { createMentor, listMentors, updateMentor } from './mentorStore.js';
import { createMentee, listMentees, updateMentee } from './menteeStore.js';
import { useDb } from '../lib/dataMode.js';

async function findMentorByEmail(email) {
  const normalized = email.toLowerCase().trim();
  if (useDb()) {
    const doc = await MentorProfile.findOne({ email: normalized }).lean();
    return doc ? { ...doc, _id: String(doc._id) } : null;
  }
  return (await listMentors()).find((m) => m.email?.toLowerCase() === normalized) || null;
}

async function findMenteeByEmail(email) {
  const normalized = email.toLowerCase().trim();
  if (useDb()) {
    const doc = await MenteeProfile.findOne({ email: normalized }).lean();
    return doc ? { ...doc, _id: String(doc._id) } : null;
  }
  return (await listMentees()).find((m) => m.email?.toLowerCase() === normalized) || null;
}

/**
 * Ensure CRM list profile exists for a registered / OAuth user.
 * Returns { mentorId?, menteeId? } for JWT profile enrichment.
 */
export async function ensureCrmProfileForUser({ email, name, role, userId }) {
  const normalizedEmail = email.toLowerCase().trim();
  const profileIds = {};

  if (role === 'mentor') {
    let mentor = await findMentorByEmail(normalizedEmail);
    if (!mentor) {
      mentor = await createMentor({
        _id: `u_${userId}`,
        userId,
        name: name || normalizedEmail,
        email: normalizedEmail,
        track: 'tech',
        bio: '',
        expertise: [],
        maxMentees: 5,
        mentorshipType: 'GROUP',
        duration: 'LONG_TERM',
      });
    } else if (userId && mentor.userId !== userId) {
      mentor = await updateMentor(mentor._id, { userId });
    }
    profileIds.mentorId = mentor._id;
  }

  if (role === 'mentee') {
    let mentee = await findMenteeByEmail(normalizedEmail);
    if (!mentee) {
      mentee = await createMentee({
        _id: `u_${userId}`,
        userId,
        name: name || normalizedEmail,
        email: normalizedEmail,
        track: 'tech',
        interests: [],
        progress: 0,
        mentorshipType: 'GROUP',
        applicationStatus: 'pending',
      });
    } else if (userId && mentee.userId !== userId) {
      mentee = await updateMentee(mentee._id, { userId });
    }
    profileIds.menteeId = mentee._id;
  }

  return profileIds;
}
