/**
 * In-memory store tests (no MongoDB required)
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { listMentors, createMentor, seedMentorsIfEmpty } from '../services/mentorStore.js';
import { listMentees, seedMenteesIfEmpty } from '../services/menteeStore.js';
import { listGroups, seedGroupsIfEmpty } from '../services/groupStore.js';
import { listActivities, createActivity, seedActivitiesIfEmpty } from '../services/activityStore.js';
import { isDemoAuthEnabled, DEMO_USER } from '../config/demoAuth.js';

describe('CRM stores (in-memory)', () => {
  beforeEach(async () => {
    await seedMentorsIfEmpty();
    await seedMenteesIfEmpty();
    await seedGroupsIfEmpty();
    await seedActivitiesIfEmpty();
  });

  it('seeds mentors', async () => {
    const mentors = await listMentors();
    expect(mentors.length).toBeGreaterThanOrEqual(1);
    expect(mentors[0]).toHaveProperty('_id');
    expect(mentors[0]).toHaveProperty('email');
  });

  it('creates a mentor and lists it', async () => {
    const created = await createMentor({
      name: 'Test Mentor',
      email: `test-${Date.now()}@example.com`,
      track: 'tech',
      maxMentees: 3,
    });
    const mentors = await listMentors();
    expect(mentors.some((m) => m._id === created._id)).toBe(true);
  });

  it('seeds mentees with applicationStatus', async () => {
    const mentees = await listMentees();
    expect(mentees.length).toBeGreaterThan(0);
    expect(mentees[0].applicationStatus).toBeDefined();
  });

  it('seeds groups', async () => {
    const groups = await listGroups();
    expect(groups.length).toBeGreaterThan(0);
    expect(groups[0]).toHaveProperty('mentorId');
  });

  it('lists activities with createdAt', async () => {
    const activities = await listActivities(10);
    expect(activities.length).toBeGreaterThan(0);
    expect(activities[0].createdAt || activities[0].timestamp).toBeTruthy();
  });

  it('creates activity', async () => {
    const act = await createActivity({
      type: 'test',
      description: 'Unit test activity',
    });
    expect(act._id).toBeTruthy();
    expect(act.message || act.description).toContain('Unit test');
  });
});

describe('Demo auth config', () => {
  it('exposes demo user credentials shape', () => {
    expect(DEMO_USER.email).toBe('admin@example.com');
    expect(typeof isDemoAuthEnabled()).toBe('boolean');
  });
});
