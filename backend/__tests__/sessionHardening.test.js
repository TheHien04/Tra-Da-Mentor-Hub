import request from 'supertest';
import { createApp } from '../createApp.js';
import { oauthCallbackUrl } from '../controllers/googleAuthController.js';
import { lockDataMode, resetDataMode, useDb } from '../lib/dataMode.js';
import { readIdempotent, saveIdempotent } from '../lib/idempotency.js';

afterEach(() => {
  resetDataMode();
});

describe('single data mode', () => {
  it('keeps the in-memory store after that mode is locked', () => {
    lockDataMode('memory');
    expect(useDb()).toBe(false);
  });

  it('does not serve memory data when Mongo was selected and is down', () => {
    lockDataMode('mongo');
    expect(() => useDb()).toThrow(/unavailable/i);
  });
});

describe('idempotent booking keys', () => {
  it('replays the stored response', () => {
    saveIdempotent('user-1', 'key-1', 200, { _id: 'slot-1' });
    expect(readIdempotent('user-1', 'key-1')).toMatchObject({ status: 200, body: { _id: 'slot-1' } });
    expect(readIdempotent('user-2', 'key-1')).toBeNull();
  });
});

describe('cookie session CSRF', () => {
  const app = createApp({ mountSpa: false });

  it('sets a CSRF cookie and blocks a cookie mutation without the header', async () => {
    const login = await request(app).post('/api/auth/login').send({
      email: 'admin@example.com',
      password: 'AdminPass123',
    });
    expect(login.status).toBe(200);
    const cookies = login.headers['set-cookie'] || [];
    const joined = cookies.map((line) => line.split(';')[0]).join('; ');
    const csrf = joined.match(/tdm_csrf=([^;]+)/)?.[1];
    expect(csrf).toBeTruthy();

    const blocked = await request(app).post('/api/slots').set('Cookie', joined).send({});
    expect(blocked.status).toBe(403);
    expect(blocked.body.code).toBe('CSRF');

    const passed = await request(app)
      .post('/api/slots')
      .set('Cookie', joined)
      .set('X-CSRF-Token', decodeURIComponent(csrf))
      .send({});
    expect(passed.status).not.toBe(403);
  });
});

describe('Google callback URL', () => {
  it('lands on the app without a token in the address', () => {
    const url = oauthCallbackUrl('https://app.example.com');
    expect(url).toBe('https://app.example.com/auth/callback');
    const parsed = new URL(url);
    expect(parsed.search).toBe('');
    expect(parsed.hash).toBe('');
    expect(url).not.toMatch(/accessToken|refreshToken/);
  });
});

describe('audit log covers admin writes', () => {
  const app = createApp({ mountSpa: false });

  it('records a successful broadcast', async () => {
    lockDataMode('memory');
    const login = await request(app).post('/api/auth/login').send({
      email: 'admin@example.com',
      password: 'AdminPass123',
    });
    expect(login.status).toBe(200);
    const token = login.body?.data?.accessToken;
    expect(token).toBeTruthy();

    const sent = await request(app)
      .post('/api/admin/broadcast')
      .set('Authorization', `Bearer ${token}`)
      .send({ message: 'hello', channel: 'in_app' });
    expect(sent.status).toBe(200);

    await new Promise((resolve) => setImmediate(resolve));

    const audit = await request(app)
      .get('/api/admin/audit')
      .set('Authorization', `Bearer ${token}`);
    expect(audit.status).toBe(200);
    const actions = (audit.body.data || []).map((row) => row.action);
    expect(actions).toContain('admin.post');
  });
});
