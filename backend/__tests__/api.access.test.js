/**
 * Role and ownership checks for CRM writes.
 */
import request from 'supertest';
import {
  getTestApp,
  connectTestMongo,
  disconnectTestMongo,
  clearTestCollections,
  loginAsAdmin,
} from './helpers/mongoTest.js';
import MentorProfile from '../models/MentorProfile.js';
import MenteeProfile from '../models/MenteeProfile.js';

function futureDate(days = 30) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

async function registerAndLogin(email, role) {
  const app = getTestApp();
  const password = 'TestPass123';
  const registered = await request(app).post('/api/auth/register').send({
    email,
    password,
    confirmPassword: password,
    name: role,
    role,
  });
  if (registered.status !== 201) {
    throw new Error(`register failed ${registered.status} ${JSON.stringify(registered.body)}`);
  }
  return {
    token: registered.body.data.accessToken,
    refreshToken: registered.body.data.refreshToken,
    user: registered.body.data.user,
  };
}

describe('API access control', () => {
  beforeAll(async () => {
    process.env.ENABLE_DEMO_AUTH = 'true';
    await connectTestMongo();
  });

  beforeEach(async () => {
    await clearTestCollections();
  });

  afterAll(async () => {
    await disconnectTestMongo();
  });

  it('blocks a mentee from deleting a mentor', async () => {
    const app = getTestApp();
    const admin = await loginAsAdmin();
    const mentor = await MentorProfile.create({
      _id: 'm-access',
      name: 'Owned Mentor',
      email: 'owned-mentor@test.com',
      track: 'tech',
      expertise: ['Node'],
      maxMentees: 2,
    });
    const mentee = await registerAndLogin(`mentee-${Date.now()}@test.com`, 'mentee');

    const denied = await request(app)
      .delete(`/api/mentors/${mentor._id}`)
      .set('Authorization', `Bearer ${mentee.token}`);
    expect(denied.status).toBe(403);
    expect(denied.body.code).toBe('FORBIDDEN');

    const allowed = await request(app)
      .delete(`/api/mentors/${mentor._id}`)
      .set('Authorization', `Bearer ${admin}`);
    expect(allowed.status).toBe(200);
  });

  it('books a slot as the signed-in mentee, not a body id', async () => {
    const app = getTestApp();
    const mentee = await registerAndLogin(`book-${Date.now()}@test.com`, 'mentee');
    await MentorProfile.create({
      _id: 'm-slot',
      name: 'Slot Owner',
      email: 'slot-owner@test.com',
      track: 'tech',
      expertise: ['React'],
      maxMentees: 3,
    });
    const created = await request(app)
      .post('/api/slots')
      .set('Authorization', `Bearer ${await loginAsAdmin()}`)
      .send({ mentorId: 'm-slot', date: futureDate(), time: '11:00', duration: 60 });
    expect(created.status).toBe(201);

    const booked = await request(app)
      .patch(`/api/slots/${created.body._id}/book`)
      .set('Authorization', `Bearer ${mentee.token}`)
      .send({ menteeId: 'someone-else' });
    expect(booked.status).toBe(200);
    expect(booked.body.menteeId).toBe(mentee.user.menteeId);
  });

  it('rotates the refresh token', async () => {
    const app = getTestApp();
    const mentee = await registerAndLogin(`refresh-${Date.now()}@test.com`, 'mentee');
    const refreshed = await request(app).post('/api/auth/refresh').send({
      refreshToken: mentee.refreshToken,
    });
    expect(refreshed.status).toBe(200);
    expect(refreshed.body.data.accessToken).toBeTruthy();
    expect(refreshed.body.data.refreshToken).toBeTruthy();
    expect(refreshed.body.data.refreshToken).not.toBe(mentee.refreshToken);
  });

  it('ignores a spoofed notification user id', async () => {
    const app = getTestApp();
    const mentee = await registerAndLogin(`note-${Date.now()}@test.com`, 'mentee');
    await MenteeProfile.create({
      _id: 'other-mentee',
      name: 'Other',
      email: 'other-note@test.com',
      track: 'tech',
    });
    const list = await request(app)
      .get('/api/notifications')
      .query({ userId: 'someone-else' })
      .set('x-user-id', 'someone-else')
      .set('Authorization', `Bearer ${mentee.token}`);
    expect(list.status).toBe(200);
    expect(list.body.success).toBe(true);
    expect(list.body.data.every((n) => n.userId === 'all' || n.userId === 'mentees' || n.userId === mentee.user._id)).toBe(true);
  });

  it('keeps a broadcast read receipt isolated per authenticated user', async () => {
    const app = getTestApp();
    const admin = await loginAsAdmin();
    const first = await registerAndLogin(`receipt-one-${Date.now()}@test.com`, 'mentee');
    const second = await registerAndLogin(`receipt-two-${Date.now()}@test.com`, 'mentee');
    const created = await request(app)
      .post('/api/notifications')
      .set('Authorization', `Bearer ${admin}`)
      .send({ userId: 'all', title: 'Private read receipt', message: 'QA' });
    expect(created.status).toBe(201);

    const marked = await request(app)
      .patch(`/api/notifications/${created.body.data._id}/read`)
      .set('Authorization', `Bearer ${first.token}`);
    expect(marked.status).toBe(200);

    const firstList = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${first.token}`);
    const secondList = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${second.token}`);
    const firstRow = firstList.body.data.find((row) => row._id === created.body.data._id);
    const secondRow = secondList.body.data.find((row) => row._id === created.body.data._id);
    expect(firstRow.read).toBe(true);
    expect(secondRow.read).toBe(false);
  });

  it('blocks a mentor from logging a session with an unrelated mentee', async () => {
    const app = getTestApp();
    const admin = await loginAsAdmin();
    const email = `mentor-log-${Date.now()}@test.com`;
    const invite = await request(app)
      .post('/api/invites')
      .set('Authorization', `Bearer ${admin}`)
      .send({ email, role: 'mentor' });
    expect(invite.status).toBe(201);
    const mentor = await request(app).post('/api/auth/register').send({
      email,
      password: 'TestPass123',
      confirmPassword: 'TestPass123',
      name: 'Session Mentor',
      role: 'mentor',
      inviteToken: invite.body.token,
    });
    expect(mentor.status).toBe(201);
    await MenteeProfile.create({
      _id: 'unrelated-log-mentee',
      name: 'Unrelated Log Mentee',
      email: 'unrelated-log-mentee@test.com',
      track: 'tech',
      applicationStatus: 'accepted',
    });

    const logged = await request(app)
      .post('/api/session-logs')
      .set('Authorization', `Bearer ${mentor.body.data.accessToken}`)
      .send({
        mentorId: mentor.body.data.user.mentorId,
        menteeId: 'unrelated-log-mentee',
        sessionDate: new Date().toISOString(),
        topic: 'Unauthorized pairing',
      });
    expect(logged.status).toBe(409);
    expect(logged.body.code).toBe('MENTORING_RELATIONSHIP_REQUIRED');
  });
});
