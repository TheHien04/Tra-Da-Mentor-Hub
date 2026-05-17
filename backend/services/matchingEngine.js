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

export function scoreMentorForMentee(mentor, mentee) {
  const { matches, score: skillScore } = skillOverlap(mentor.expertise || [], mentee.interests || []);
  const trackMatch = mentor.track && mentee.track && mentor.track === mentee.track ? 1 : 0;
  const cap = capacityScore(mentor);
  const progressBoost = (mentee.progress || 0) < 100 ? 0.1 : 0;

  const total =
    skillScore * 0.5 + trackMatch * 0.2 + cap * 0.25 + progressBoost;

  const reasons = [];
  if (matches.length) reasons.push(`Kỹ năng trùng: ${matches.slice(0, 3).join(', ')}`);
  if (trackMatch) reasons.push('Cùng lĩnh vực (track)');
  if (cap > 0.5) reasons.push('Mentor còn slot trống');
  if (!reasons.length) reasons.push('Gợi ý dựa trên hồ sơ tổng quan');

  return {
    mentorId: mentor._id,
    mentorName: mentor.name,
    menteeId: mentee._id,
    menteeName: mentee.name || mentee.email,
    score: Math.round(Math.min(99, total * 100)),
    matchedSkills: matches,
    reasons,
    capacity: {
      active: mentor.mentees?.length || 0,
      max: mentor.maxMentees || 10,
    },
  };
}

export function getMatchSuggestions(mentors, mentees, { menteeId, mentorId, limit = 8 } = {}) {
  const results = [];

  if (menteeId) {
    const mentee = mentees.find((m) => m._id === menteeId);
    if (!mentee) return [];
    for (const mentor of mentors) {
      results.push(scoreMentorForMentee(mentor, mentee));
    }
    return results.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  if (mentorId) {
    const mentor = mentors.find((m) => m._id === mentorId);
    if (!mentor) return [];
    for (const mentee of mentees) {
      const row = scoreMentorForMentee(mentor, mentee);
      results.push({ ...row, type: 'mentee' });
    }
    return results.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  // Platform-wide top pairs
  for (const mentee of mentees) {
    for (const mentor of mentors) {
      if ((mentor.mentees?.length || 0) >= (mentor.maxMentees || 10)) continue;
      results.push(scoreMentorForMentee(mentor, mentee));
    }
  }
  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}
