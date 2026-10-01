/** Fields a client may write. Store helpers stay open for CRM and uploads. */

export function pickFields(body, keys) {
  const out = {};
  if (!body || typeof body !== 'object') return out;
  for (const key of keys) {
    if (body[key] !== undefined) out[key] = body[key];
  }
  return out;
}

export const MENTOR_OWNER_FIELDS = [
  'name',
  'email',
  'phone',
  'bio',
  'expertise',
  'track',
  'mentorshipType',
  'duration',
  'maxMentees',
  'avatarUrl',
];

export const MENTOR_ADMIN_FIELDS = [...MENTOR_OWNER_FIELDS, 'mentees', 'groups'];

export const MENTEE_OWNER_FIELDS = [
  'name',
  'email',
  'phone',
  'school',
  'interests',
  'goals',
  'track',
  'bio',
  'avatarUrl',
];

export const MENTEE_ADMIN_FIELDS = [
  ...MENTEE_OWNER_FIELDS,
  'mentorId',
  'groupId',
  'progress',
  'applicationStatus',
  'mentorshipType',
];

export const GROUP_MANAGER_FIELDS = [
  'name',
  'description',
  'topic',
  'maxSize',
  'maxCapacity',
  'meetingSchedule',
];

export const GROUP_ADMIN_FIELDS = [...GROUP_MANAGER_FIELDS, 'mentorId'];

function canSeeMentorPrivate(actor, row) {
  if (!row) return false;
  if (actor?.isAdmin) return true;
  return Boolean(actor?.mentorId) && String(actor.mentorId) === String(row._id);
}

function canSeeMenteePhone(actor, row) {
  if (!row) return false;
  if (actor?.isAdmin) return true;
  if (actor?.menteeId && String(actor.menteeId) === String(row._id)) return true;
  return actor?.role === 'mentor' && actor.mentorId && row.mentorId === actor.mentorId;
}

export function redactMentor(row, actor) {
  if (!row || canSeeMentorPrivate(actor, row)) return row;
  const copy = { ...row };
  delete copy.phone;
  delete copy.userId;
  return copy;
}

export function redactMentee(row, actor) {
  if (!row) return row;
  const self = actor?.menteeId && String(actor.menteeId) === String(row._id);
  if (actor?.isAdmin || self) return row;
  const copy = { ...row };
  delete copy.userId;
  if (!canSeeMenteePhone(actor, row)) delete copy.phone;
  return copy;
}

export function redactGroup(group, actor) {
  if (!group) return group;
  const next = { ...group };
  if (next.mentor && typeof next.mentor === 'object') {
    const owner =
      actor?.isAdmin || (actor?.mentorId && String(actor.mentorId) === String(next.mentorId));
    if (!owner) {
      const mentor = { ...next.mentor };
      delete mentor.phone;
      delete mentor.userId;
      next.mentor = mentor;
    }
  }
  if (Array.isArray(next.mentees)) {
    next.mentees = next.mentees.map((mentee) =>
      mentee && typeof mentee === 'object' ? redactMentee(mentee, actor) : mentee
    );
  }
  return next;
}

export function mapDirectory(result, mapRow) {
  if (!result) return result;
  if (result.paged) {
    return {
      ...result,
      body: {
        ...result.body,
        data: (result.body.data || []).map(mapRow),
      },
    };
  }
  return { ...result, data: (result.data || []).map(mapRow) };
}
