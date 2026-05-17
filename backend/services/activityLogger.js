import { createActivity } from './activityStore.js';

/** Fire-and-forget platform activity log */
export function logActivity(payload) {
  createActivity(payload).catch(() => {});
}

export function logMentorCreated(mentor) {
  logActivity({
    type: 'mentor_created',
    actor: { id: mentor._id, name: mentor.name, avatar: '👨‍🏫' },
    action: 'joined as mentor',
    target: 'Mentor Program',
    description: `Mentor ${mentor.name} joined the program`,
  });
}

export function logMenteeCreated(mentee) {
  logActivity({
    type: 'mentee_created',
    actor: { id: mentee._id, name: mentee.name, avatar: '👨‍🎓' },
    action: 'joined as mentee',
    target: 'Mentee Program',
    description: `Mentee ${mentee.name} joined the program`,
  });
}

export function logGroupCreated(group, mentorName) {
  logActivity({
    type: 'mentor_created_group',
    actor: { id: group.mentorId, name: mentorName || 'Mentor', avatar: '👩‍🏫' },
    action: 'created group',
    target: group.name,
    description: `Group "${group.name}" was created`,
  });
}
