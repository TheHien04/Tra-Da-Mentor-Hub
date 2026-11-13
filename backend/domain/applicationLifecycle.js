export const APPLICATION_STATUSES = [
  'pending',
  'invited_for_interview',
  'interviewed',
  'accepted',
  'rejected',
];

const TRANSITIONS = Object.freeze({
  pending: Object.freeze(['invited_for_interview', 'rejected']),
  invited_for_interview: Object.freeze(['interviewed', 'rejected']),
  interviewed: Object.freeze(['accepted', 'rejected']),
  accepted: Object.freeze([]),
  rejected: Object.freeze([]),
});

export function allowedApplicationTransitions(status) {
  return [...(TRANSITIONS[status] || [])];
}

export function canTransitionApplication(from, to) {
  return allowedApplicationTransitions(from).includes(to);
}

export function applicationTransitionError(from, to) {
  return {
    error: 'invalid_transition',
    currentStatus: from,
    requestedStatus: to,
    allowedTransitions: allowedApplicationTransitions(from),
  };
}
