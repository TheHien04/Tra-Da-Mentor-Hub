/**
 * Admin API integration tests.
 */
import request from 'supertest';
import {
  getTestApp,
  connectTestMongo,
  disconnectTestMongo,
  clearTestCollections,
  loginAsAdmin,
} from './helpers/mongoTest.js';

describe('Admin API (MongoDB)', () => {
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

  it('GET /api/admin/integrations returns channel flags', async () => {
    const res = await request(getTestApp())
      .get('/api/admin/integrations')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('inApp', true);
    expect(res.body.data).toHaveProperty('email');
    expect(res.body.data).toHaveProperty('zalo');
  });

  it('POST /api/admin/broadcast creates in-app notification', async () => {
    const res = await request(getTestApp())
      .post('/api/admin/broadcast')
      .set('Authorization', `Bearer ${token}`)
      .send({
        audience: 'all',
        subject: 'CI broadcast',
        message: 'Integration test broadcast',
        channel: 'in_app',
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.delivery.inApp).toBe(true);
  });

  it('GET /api/admin/broadcasts lists history', async () => {
    const app = getTestApp();
    await request(app)
      .post('/api/admin/broadcast')
      .set('Authorization', `Bearer ${token}`)
      .send({
        audience: 'mentors',
        message: 'History row',
        channel: 'in_app',
      });

    const res = await request(app)
      .get('/api/admin/broadcasts')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('POST /api/invites creates invite (admin)', async () => {
    const email = `invite-${Date.now()}@test.com`;
    const res = await request(getTestApp())
      .post('/api/invites')
      .set('Authorization', `Bearer ${token}`)
      .send({ email, role: 'mentee' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeTruthy();

    const validate = await request(getTestApp()).get(`/api/invites/validate/${res.body.token}`);
    expect(validate.status).toBe(200);
    expect(validate.body.valid).toBe(true);
    expect(validate.body.email).toBe(email);
  });
});
