/**
 * In-memory store tests (no MongoDB required)
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  listMentors,
  getMentorById,
  createMentor,
  updateMentor,
  deleteMentor,
  queryMentorDirectory,
  seedMentorsIfEmpty,
} from '../services/mentorStore.js';
import {
  listMentees,
  getMenteeById,
  createMentee,
  updateMentee,
  assignMenteeToGroup,
  clearMenteeGroup,
  deleteMentee,
  queryMenteeDirectory,
  seedMenteesIfEmpty,
} from '../services/menteeStore.js';
import {
  listGroups,
  getGroupById,
  createGroup,
  updateGroup,
  addMenteeToGroup,
  removeMenteeFromGroup,
  deleteGroup,
  queryGroupDirectory,
  seedGroupsIfEmpty,
} from '../services/groupStore.js';
import {
  listActivities,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
  seedActivitiesIfEmpty,
} from '../services/activityStore.js';
import { isDemoAuthEnabled, DEMO_USER } from '../config/demoAuth.js';
import {
  createNotification,
  listBroadcastNotifications,
  listNotifications,
  listNotificationsForActor,
  markRead,
  markAllRead,
  seedDemoNotifications,
} from '../services/notificationStore.js';
import {
  bookSlot,
  cancelBooking,
  createSlot,
  deleteSlot,
  getSlotById,
  hasSlotConflict,
  listSlots,
  seedSlotsIfEmpty,
  updateSlot,
  withSlotLock,
} from '../services/slotStore.js';
import {
  listNeedsSupport,
  listSessionLogs,
  seedSessionLogsIfEmpty,
  sessionLogPatch,
  upsertSessionLog,
} from '../services/sessionLogStore.js';
import {
  consumeInviteToken,
  createInvite,
  inviteStatus,
  listInvites,
  revokeInvite,
  serializeInvite,
  validateInviteToken,
} from '../services/inviteStore.js';

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

  it('updates, queries and deletes a mentor without losing identity', async () => {
    const id = `mentor-crud-${Date.now()}`;
    await createMentor({ _id: id, name: 'Coverage Mentor', email: `${id}@example.com`, track: 'tech' });
    expect((await getMentorById(id))?.name).toBe('Coverage Mentor');
    const updated = await updateMentor(id, { bio: 'Updated bio' });
    expect(updated).toEqual(expect.objectContaining({ _id: id, bio: 'Updated bio' }));
    const directory = await queryMentorDirectory({ q: 'Coverage Mentor', page: 1, limit: 10 });
    expect(directory.body.data.some((row) => row._id === id)).toBe(true);
    expect((await deleteMentor(id))?._id).toBe(id);
    expect(await getMentorById(id)).toBeNull();
  });

  it('normalizes mentees and protects one-group assignment', async () => {
    const id = `mentee-crud-${Date.now()}`;
    await createMentee({ _id: id, name: 'Coverage Mentee', email: `${id}@EXAMPLE.COM`, track: 'tech' });
    expect((await getMenteeById(id))?.email).toBe(`${id}@example.com`);
    expect((await updateMentee(id, { school: 'NUS' }))?.school).toBe('NUS');
    expect((await assignMenteeToGroup(id, 'group-a'))?.groupId).toBe('group-a');
    expect(await assignMenteeToGroup(id, 'group-b')).toBeNull();
    expect((await clearMenteeGroup(id, 'group-a'))?.groupId).toBeNull();
    const directory = await queryMenteeDirectory({ q: 'Coverage Mentee', page: 1, limit: 10 });
    expect(directory.body.data.some((row) => row._id === id)).toBe(true);
    expect((await deleteMentee(id))?._id).toBe(id);
  });

  it('enforces group capacity across CRUD operations', async () => {
    const id = `group-crud-${Date.now()}`;
    await createGroup({ _id: id, name: 'Coverage Group', mentorId: 'm1', maxSize: 1 });
    expect((await getGroupById(id))?.mentees).toEqual([]);
    expect((await addMenteeToGroup(id, 'mentee-a'))?.mentees).toEqual(['mentee-a']);
    expect(await addMenteeToGroup(id, 'mentee-b')).toBeNull();
    expect((await removeMenteeFromGroup(id, 'mentee-a'))?.mentees).toEqual([]);
    expect((await updateGroup(id, { topic: 'Quality engineering' }))?.topic).toBe('Quality engineering');
    const directory = await queryGroupDirectory({ q: 'Coverage Group', page: 1, limit: 10 });
    expect(directory.body.data.some((row) => row._id === id)).toBe(true);
    expect((await deleteGroup(id))?._id).toBe(id);
  });

  it('supports complete activity lifecycle', async () => {
    const created = await createActivity({ type: 'qa', description: 'Lifecycle activity' });
    expect((await getActivityById(created._id))?._id).toBe(created._id);
    expect((await updateActivity(created._id, { action: 'verified' }))?.action).toBe('verified');
    expect((await deleteActivity(created._id))?._id).toBe(created._id);
    expect(await getActivityById(created._id)).toBeNull();
  });

  it('keeps broadcast read receipts private to each recipient', async () => {
    const created = await createNotification({
      userId: 'all',
      title: `Receipt isolation ${Date.now()}`,
      message: 'Shared content, private state',
    });
    await markRead(created._id, ['all', 'user-one'], 'user-one');

    const first = (await listNotifications(['all', 'user-one'], 'user-one'))
      .find((row) => row._id === created._id);
    const second = (await listNotifications(['all', 'user-two'], 'user-two'))
      .find((row) => row._id === created._id);
    expect(first?.read).toBe(true);
    expect(second?.read).toBe(false);
  });

  it('routes notifications and marks all receipts for only the current actor', async () => {
    const events = [];
    const io = { to: (room) => ({ emit: (event, data) => events.push({ room, event, data }) }) };
    const direct = await createNotification(
      { userId: 'notify-user', title: 'Direct', message: 'Private' },
      io
    );
    await createNotification({ userId: 'mentees', title: 'Mentee broadcast' }, io);
    const actor = { userId: 'notify-user', role: 'mentee', isAdmin: false };
    const visible = await listNotificationsForActor(actor);
    expect(visible.some((row) => row._id === direct._id)).toBe(true);
    expect(events).toEqual(expect.arrayContaining([
      expect.objectContaining({ room: 'user:notify-user', event: 'notification' }),
      expect.objectContaining({ room: 'role:mentees', event: 'notification' }),
    ]));
    await markAllRead(['all', 'mentees', actor.userId], actor.userId);
    expect((await listNotificationsForActor(actor)).every((row) => row.read)).toBe(true);
    seedDemoNotifications();
    expect((await listBroadcastNotifications(3)).length).toBeLessThanOrEqual(3);
  });

  it('handles slot conflict, booking, cancellation, update and deletion', async () => {
    await seedSlotsIfEmpty();
    const suffix = Date.now();
    const date = new Date(Date.now() + 45 * 86400000).toISOString().slice(0, 10);
    const slot = await createSlot({ mentorId: `slot-mentor-${suffix}`, date, time: '09:30', duration: 60 });
    expect((await getSlotById(slot._id))?._id).toBe(slot._id);
    expect(await hasSlotConflict({ mentorId: slot.mentorId, date, time: '10:00', duration: 30 })).toBe(true);
    expect(await hasSlotConflict({ mentorId: slot.mentorId, date, time: '10:30', duration: 30 })).toBe(false);
    expect((await bookSlot(slot._id, 'slot-mentee'))?.bookedBy).toBe('slot-mentee');
    expect(await bookSlot(slot._id, 'other-mentee')).toBeNull();
    expect((await cancelBooking(slot._id))?.bookedBy).toBeNull();
    expect((await updateSlot(slot._id, { time: '11:00', meetingLink: 'https://meet.google.com/test' }))?.time).toBe('11:00');
    const available = await listSlots({ mentorId: slot.mentorId, availableOnly: true });
    expect(available.map((row) => row._id)).toContain(slot._id);
    expect((await deleteSlot(slot._id))?._id).toBe(slot._id);
    expect(await deleteSlot('missing-slot')).toBeNull();
  });

  it('serializes competing work with the per-resource slot lock', async () => {
    const order = [];
    await Promise.all([
      withSlotLock('same-resource', async () => {
        order.push('first-start');
        await Promise.resolve();
        order.push('first-end');
      }),
      withSlotLock('same-resource', async () => order.push('second')),
    ]);
    expect(order).toEqual(['first-start', 'first-end', 'second']);
  });

  it('clamps session feedback and upserts one log per mentoring day', async () => {
    expect(sessionLogPatch({ mentorScore: 99, menteeScore: 0, mentorSupportReason: 'x' }, { create: true }))
      .toEqual(expect.objectContaining({ mentorScore: 5, menteeScore: 1, mentorSupportReason: 'x' }));
    const suffix = Date.now();
    const payload = {
      mentorId: `session-mentor-${suffix}`,
      menteeId: `session-mentee-${suffix}`,
      sessionDate: new Date().toISOString(),
      topic: 'Initial topic',
      mentorNeedsSupport: true,
    };
    const first = await upsertSessionLog(payload);
    const second = await upsertSessionLog({ ...payload, topic: 'Updated topic', mentorScore: 4 });
    expect(first.created).toBe(true);
    expect(second.created).toBe(false);
    expect(second.log).toEqual(expect.objectContaining({ _id: first.log._id, topic: 'Updated topic', mentorScore: 4 }));
    expect((await listSessionLogs({ mentorId: payload.mentorId })).map((row) => row._id)).toContain(first.log._id);
    expect((await listNeedsSupport()).map((row) => row._id)).toContain(first.log._id);
    await seedSessionLogsIfEmpty();
  });

  it('covers the full invite lifecycle and rejects identity substitution', async () => {
    const email = `invite-store-${Date.now()}@example.com`;
    const invite = await createInvite({ email: `  ${email.toUpperCase()}  `, role: 'MENTEE', createdBy: 'admin' });
    expect(invite).toEqual(expect.objectContaining({ email, role: 'mentee', status: 'active' }));
    expect((await listInvites()).some((row) => row.token === invite.token)).toBe(true);
    expect(await validateInviteToken(invite.token)).toEqual({ valid: true, email, role: 'mentee' });
    expect(await consumeInviteToken(invite.token, { email: 'attacker@example.com' }))
      .toEqual(expect.objectContaining({ ok: false, status: 400 }));
    expect(await consumeInviteToken(invite.token, { email })).toEqual({ ok: true, role: 'mentee' });
    expect(await validateInviteToken(invite.token)).toEqual(expect.objectContaining({ valid: false, status: 410 }));
    expect(await revokeInvite(invite.token)).toBe(true);
    expect(await validateInviteToken(invite.token)).toEqual(expect.objectContaining({ valid: false, status: 404 }));
  });

  it('classifies and serializes expired and used invites', () => {
    const old = new Date(Date.now() - 8 * 86400000).toISOString();
    expect(inviteStatus({ createdAt: old, usedAt: null })).toBe('expired');
    expect(inviteStatus({ createdAt: new Date(), usedAt: new Date() })).toBe('used');
    const serialized = serializeInvite('token', {
      email: 'person@example.com',
      role: 'mentor',
      createdAt: old,
      usedAt: null,
    });
    expect(serialized).toEqual(expect.objectContaining({ token: 'token', status: 'expired' }));
    expect(serialized.expiresAt).toMatch(/T/);
  });
});

describe('Demo auth config', () => {
  it('exposes demo user credentials shape', () => {
    expect(DEMO_USER.email).toBe('admin@example.com');
    expect(typeof isDemoAuthEnabled()).toBe('boolean');
  });
});
