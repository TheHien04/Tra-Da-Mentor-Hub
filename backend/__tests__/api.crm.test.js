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
          date: '2026-12-01',
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
  });
});
