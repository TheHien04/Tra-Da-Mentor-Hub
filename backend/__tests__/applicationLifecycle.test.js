import { describe, expect, it } from '@jest/globals';
import {
  APPLICATION_STATUSES,
  allowedApplicationTransitions,
  canTransitionApplication,
} from '../domain/applicationLifecycle.js';
import {
  createMentee,
  updateMenteeApplicationStatus,
} from '../services/menteeStore.js';

describe('application lifecycle', () => {
  it('requires interview steps before acceptance', () => {
    expect(canTransitionApplication('pending', 'accepted')).toBe(false);
    expect(canTransitionApplication('pending', 'invited_for_interview')).toBe(true);
    expect(canTransitionApplication('invited_for_interview', 'interviewed')).toBe(true);
    expect(canTransitionApplication('interviewed', 'accepted')).toBe(true);
  });

  it('allows rejection before a final decision', () => {
    expect(canTransitionApplication('pending', 'rejected')).toBe(true);
    expect(canTransitionApplication('invited_for_interview', 'rejected')).toBe(true);
    expect(canTransitionApplication('interviewed', 'rejected')).toBe(true);
  });

  it('keeps final decisions terminal', () => {
    expect(allowedApplicationTransitions('accepted')).toEqual([]);
    expect(allowedApplicationTransitions('rejected')).toEqual([]);
    expect(APPLICATION_STATUSES).toHaveLength(5);
  });

  it('records an auditable history and rejects shortcuts in the store', async () => {
    const mentee = await createMentee({
      _id: `workflow-${Date.now()}`,
      name: 'Workflow Test',
      email: `workflow-${Date.now()}@example.com`,
      track: 'tech',
    });

    const shortcut = await updateMenteeApplicationStatus(mentee._id, 'accepted');
    expect(shortcut.error).toBe('invalid_transition');
    expect(shortcut.allowedTransitions).toContain('invited_for_interview');

    const invited = await updateMenteeApplicationStatus(mentee._id, 'invited_for_interview', {
      actorId: 'admin-1',
      actorRole: 'admin',
      reason: 'Qualified for interview',
    });
    expect(invited.applicationStatus).toBe('invited_for_interview');
    expect(invited.applicationHistory).toHaveLength(1);
    expect(invited.applicationHistory[0]).toMatchObject({
      from: 'pending',
      to: 'invited_for_interview',
      actorId: 'admin-1',
      actorRole: 'admin',
      reason: 'Qualified for interview',
    });
  });
});
