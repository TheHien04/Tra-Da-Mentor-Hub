/**
 * Skill-based mentor ↔ mentee matching (explainable scores, no external AI API).
 */

function normalizeSkill(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/\.js$/i, '')
    .replace(/[^a-z0-9+#]/g, '')
    .trim();
}

function skillOverlap(mentorSkills = [], menteeInterests = []) {
  const mSet = new Set(mentorSkills.map(normalizeSkill).filter(Boolean));
  const matches = [];
  for (const interest of menteeInterests) {
    const n = normalizeSkill(interest);
    if (!n) continue;
    for (const skill of mSet) {
      if (skill === n || skill.includes(n) || n.includes(skill)) {
        matches.push(interest);
        break;
      }
    }
  }
  const union = new Set([...mentorSkills.map(normalizeSkill), ...menteeInterests.map(normalizeSkill)].filter(Boolean));
  const score = union.size ? matches.length / union.size : 0;
  return { matches: [...new Set(matches)], score: Math.min(1, score + matches.length * 0.08) };
}

function capacityScore(mentor) {
  const active = mentor.mentees?.length || 0;
  const max = mentor.maxMentees || 10;
  if (active >= max) return 0;
  return 1 - active / max;
}

function hasCapacity(mentor) {
  return (mentor.mentees?.length || 0) < (mentor.maxMentees || 10);
}

function isEligibleMentee(mentee) {
  return mentee.applicationStatus === 'accepted' && !mentee.mentorId;
}

export function scoreMentorForMentee(mentor, mentee) {
  const { matches, score: skillScore } = skillOverlap(mentor.expertise || [], mentee.interests || []);
  const trackMatch = mentor.track && mentee.track && mentor.track === mentee.track ? 1 : 0;
  const cap = capacityScore(mentor);
  const progressBoost = (mentee.progress || 0) < 100 ? 0.1 : 0;

  const total =
    skillScore * 0.5 + trackMatch * 0.2 + cap * 0.25 + progressBoost;

  const reasons = [];
  const reasonCodes = [];
  if (matches.length) {
    const skills = matches.slice(0, 3);
    reasonCodes.push({ code: 'skills', skills });
    reasons.push(`Shared skills: ${skills.join(', ')}`);
  }
  if (trackMatch) {
    reasonCodes.push({ code: 'track' });
    reasons.push('Same track');
  }
  if (cap > 0.5) {
    reasonCodes.push({ code: 'capacity' });
    reasons.push('Mentor still has room');
  }
  if (!reasonCodes.length) {
    reasonCodes.push({ code: 'profile' });
    reasons.push('Suggested from the overall profile');
  }

  return {
    mentorId: mentor._id,
    mentorName: mentor.name,
    menteeId: mentee._id,
    menteeName: mentee.name || mentee.email,
    score: Math.round(Math.min(99, total * 100)),
    factors: {
      skills: Math.round(Math.min(1, skillScore) * 100),
      track: trackMatch * 100,
      capacity: Math.round(cap * 100),
    },
    matchedSkills: matches,
    reasons,
    reasonCodes,
    capacity: {
      active: mentor.mentees?.length || 0,
      max: mentor.maxMentees || 10,
    },
  };
}

export function getMatchSuggestions(mentors, mentees, { menteeId, mentorId, limit = 8 } = {}) {
  const safeLimit = Math.min(50, Math.max(1, Number(limit) || 8));
  const results = [];

  if (menteeId) {
    const mentee = mentees.find((m) => m._id === menteeId);
    if (!mentee || !isEligibleMentee(mentee)) return [];
    for (const mentor of mentors.filter(hasCapacity)) {
      results.push(scoreMentorForMentee(mentor, mentee));
    }
    return results.sort((a, b) => b.score - a.score).slice(0, safeLimit);
  }

  if (mentorId) {
    const mentor = mentors.find((m) => m._id === mentorId);
    if (!mentor || !hasCapacity(mentor)) return [];
    // A mentor's suggestion queue is actionable work, not a directory of
    // people who are already being supported by somebody else.
    for (const mentee of mentees.filter(isEligibleMentee)) {
      const row = scoreMentorForMentee(mentor, mentee);
      results.push({ ...row, type: 'mentee' });
    }
    return results.sort((a, b) => b.score - a.score).slice(0, safeLimit);
  }

  // Platform-wide top pairs
  for (const mentee of mentees.filter(isEligibleMentee)) {
    for (const mentor of mentors.filter(hasCapacity)) {
      const candidate = scoreMentorForMentee(mentor, mentee);
      if (results.length < safeLimit) {
        results.push(candidate);
        continue;
      }
      let lowest = 0;
      for (let i = 1; i < results.length; i += 1) {
        if (results[i].score < results[lowest].score) lowest = i;
      }
      if (candidate.score > results[lowest].score) results[lowest] = candidate;
    }
  }
  return results.sort((a, b) => b.score - a.score);
}
