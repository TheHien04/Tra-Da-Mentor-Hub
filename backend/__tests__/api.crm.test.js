/**
 * CRM API integration tests (MongoDB + JWT).
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
import StudyGroup from '../models/StudyGroup.js';

function futureDate(days = 30) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

describe('CRM API (MongoDB)', () => {
  let token;

  beforeAll(async () => {
    process.env.ENABLE_DEMO_AUTH = 'true';
    await connectTestMongo();
  });

  beforeEach(async () => {
    await clearTestCollections();
    token = await loginAsAdmin();
  });

  afterAll(async () => {
    await disconnectTestMongo();
  });

  describe('Mentors', () => {
    it('lists mentors (empty then after create)', async () => {
      const app = getTestApp();
      const empty = await request(app)
        .get('/api/mentors')
        .set('Authorization', `Bearer ${token}`);
      expect(empty.status).toBe(200);
      expect(Array.isArray(empty.body)).toBe(true);

      const email = `mentor-${Date.now()}@test.com`;
      const created = await request(app)
        .post('/api/mentors')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Integration Mentor',
          email,
          phone: '0901234567',
          track: 'tech',
          expertise: ['JavaScript'],
          maxMentees: 5,
        });
      expect(created.status).toBe(201);
      expect(created.body.email).toBe(email);

      const list = await request(app)
        .get('/api/mentors')
        .set('Authorization', `Bearer ${token}`);
      expect(list.body.some((m) => m.email === email)).toBe(true);
    });

    it('gets mentor by id', async () => {
      const app = getTestApp();
      const doc = await MentorProfile.create({
        _id: `m${Date.now()}`,
        name: 'Detail Mentor',
        email: `detail-${Date.now()}@test.com`,
        track: 'design',
        expertise: ['UI'],
        maxMentees: 3,
      });

      const res = await request(app)
        .get(`/api/mentors/${doc._id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Detail Mentor');
    });
  });

  describe('Mentees', () => {
    it('creates and lists mentees', async () => {
      const app = getTestApp();
      const email = `mentee-${Date.now()}@test.com`;
      const created = await request(app)
        .post('/api/mentees')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Integration Mentee',
          email,
          phone: '0912345678',
          track: 'tech',
          school: 'Test University',
          progress: 10,
        });
      expect(created.status).toBe(201);

      const list = await request(app)
        .get('/api/mentees')
        .set('Authorization', `Bearer ${token}`);
      expect(list.status).toBe(200);
      expect(list.body.some((m) => m.email === email)).toBe(true);
    });
  });

  describe('Slots', () => {
    it('creates and lists a slot', async () => {
      const app = getTestApp();
      const mentor = await MentorProfile.create({
        _id: `m${Date.now()}`,
        name: 'Slot Mentor',
        email: `slot-${Date.now()}@test.com`,
        track: 'tech',
        expertise: ['Node'],
        maxMentees: 2,
      });

      const created = await request(app)
        .post('/api/slots')
        .set('Authorization', `Bearer ${token}`)
        .send({
          mentorId: mentor._id,
          date: futureDate(),
          time: '10:00',
          duration: 60,
        });
      expect(created.status).toBe(201);
      expect(created.body.mentorId).toBe(mentor._id);

      const list = await request(app)
        .get('/api/slots')
        .set('Authorization', `Bearer ${token}`);
      expect(list.status).toBe(200);
      expect(list.body.length).toBeGreaterThan(0);
    });
  });

  describe('Session logs', () => {
    it('creates a session log', async () => {
      const app = getTestApp();
      const mentor = await MentorProfile.create({
        _id: `m${Date.now()}`,
        name: 'Log Mentor',
        email: `logm-${Date.now()}@test.com`,
        track: 'tech',
        expertise: ['Coaching'],
        maxMentees: 2,
      });
      const mentee = await MenteeProfile.create({
        _id: `e${Date.now()}`,
        name: 'Log Mentee',
        email: `loge-${Date.now()}@test.com`,
        track: 'tech',
        school: 'Test U',
        progress: 20,
        mentorId: mentor._id,
      });

      const res = await request(app)
        .post('/api/session-logs')
        .set('Authorization', `Bearer ${token}`)
        .send({
          mentorId: mentor._id,
          menteeId: mentee._id,
          sessionDate: '2026-06-01',
          topic: 'Integration session',
          mentorScore: 4,
          menteeScore: 5,
        });
      expect(res.status).toBe(201);
      expect(res.body.topic).toBe('Integration session');

      const list = await request(app)
        .get('/api/session-logs')
        .set('Authorization', `Bearer ${token}`);
      expect(list.status).toBe(200);
      expect(list.body.length).toBeGreaterThan(0);
    });

    it('rejects a fabricated mentor-mentee session relationship', async () => {
      const app = getTestApp();
      await MentorProfile.create({
        _id: 'm-unrelated',
        name: 'Unrelated Mentor',
        email: 'unrelated-mentor@test.com',
        track: 'tech',
        maxMentees: 2,
      });
      await MenteeProfile.create({
        _id: 'e-unrelated',
        name: 'Unrelated Mentee',
        email: 'unrelated-mentee@test.com',
        track: 'tech',
        applicationStatus: 'accepted',
      });

      const res = await request(app)
        .post('/api/session-logs')
        .set('Authorization', `Bearer ${token}`)
        .send({
          mentorId: 'm-unrelated',
          menteeId: 'e-unrelated',
          sessionDate: new Date().toISOString(),
          topic: 'Fabricated session',
        });
      expect(res.status).toBe(409);
      expect(res.body.code).toBe('MENTORING_RELATIONSHIP_REQUIRED');
    });
  });

  describe('Group membership', () => {
    it('enforces existence, capacity, duplicate safety, and cross-group assignment', async () => {
      const app = getTestApp();
      await StudyGroup.create({
        _id: 'g-capacity',
        name: 'Capacity Group',
        topic: 'QA',
        mentorId: 'm-owner',
        maxSize: 1,
      });
      await StudyGroup.create({
        _id: 'g-other',
        name: 'Other Group',
        topic: 'QA',
        mentorId: 'm-owner',
        maxSize: 2,
      });

      const missing = await request(app)
        .post('/api/groups/g-capacity/mentees/not-real')
        .set('Authorization', `Bearer ${token}`);
      expect(missing.status).toBe(404);

      await MenteeProfile.create({
        _id: 'e-member',
        name: 'Member',
        email: 'member@test.com',
        track: 'tech',
      });
      const added = await request(app)
        .post('/api/groups/g-capacity/mentees/e-member')
        .set('Authorization', `Bearer ${token}`);
      expect(added.status).toBe(200);

      const duplicate = await request(app)
        .post('/api/groups/g-capacity/mentees/e-member')
        .set('Authorization', `Bearer ${token}`);
      expect(duplicate.status).toBe(200);
      expect(duplicate.body.mentees).toEqual(['e-member']);

      await MenteeProfile.create({
        _id: 'e-overflow',
        name: 'Overflow',
        email: 'overflow@test.com',
        track: 'tech',
      });
      const full = await request(app)
        .post('/api/groups/g-capacity/mentees/e-overflow')
        .set('Authorization', `Bearer ${token}`);
      expect(full.status).toBe(409);
      expect(full.body.code).toBe('GROUP_FULL');

      await MenteeProfile.findByIdAndUpdate('e-overflow', { groupId: 'g-other' });
      const conflict = await request(app)
        .post('/api/groups/g-capacity/mentees/e-overflow')
        .set('Authorization', `Bearer ${token}`);
      expect(conflict.status).toBe(409);
      expect(conflict.body.code).toBe('GROUP_ASSIGNMENT_CONFLICT');

      const group = await StudyGroup.findById('g-capacity').lean();
      expect(group.mentees).toEqual(['e-member']);
    });

    it('admits only one mentee when concurrent requests race for the last seat', async () => {
      const app = getTestApp();
      await StudyGroup.create({
        _id: 'g-race',
        name: 'Race Group',
        topic: 'Concurrency',
        mentorId: 'm-owner',
        maxSize: 1,
      });
      await MenteeProfile.insertMany([
        { _id: 'e-race-a', name: 'Race A', email: 'race-a@test.com', track: 'tech' },
        { _id: 'e-race-b', name: 'Race B', email: 'race-b@test.com', track: 'tech' },
      ]);

      const [first, second] = await Promise.all([
        request(app)
          .post('/api/groups/g-race/mentees/e-race-a')
          .set('Authorization', `Bearer ${token}`),
        request(app)
          .post('/api/groups/g-race/mentees/e-race-b')
          .set('Authorization', `Bearer ${token}`),
      ]);
      expect([first.status, second.status].sort()).toEqual([200, 409]);
      const group = await StudyGroup.findById('g-race').lean();
      expect(group.mentees).toHaveLength(1);
      const assignedProfiles = await MenteeProfile.countDocuments({ groupId: 'g-race' });
      expect(assignedProfiles).toBe(1);
    });
  });

  describe('Operational metrics', () => {
    it('returns an admin-only process snapshot without exposing secrets', async () => {
      const app = getTestApp();
      const response = await request(app)
        .get('/api/admin/metrics')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: expect.objectContaining({
          requests: expect.any(Number),
          inFlight: expect.any(Number),
          averageDurationMs: expect.any(Number),
          statuses: expect.objectContaining({ '2xx': expect.any(Number), '5xx': expect.any(Number) }),
          memory: expect.objectContaining({ rssBytes: expect.any(Number), heapUsedBytes: expect.any(Number) }),
        }),
      });
      expect(JSON.stringify(response.body)).not.toMatch(/JWT_SECRET|DATABASE_URL|SENDGRID_API_KEY/);
    });

    it('rejects anonymous metrics access', async () => {
      const response = await request(getTestApp()).get('/api/admin/metrics');
      expect(response.status).toBe(401);
    });
  });
});
