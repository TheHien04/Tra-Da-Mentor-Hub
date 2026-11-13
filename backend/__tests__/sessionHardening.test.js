import request from 'supertest';
import { createApp } from '../createApp.js';
import { oauthCallbackUrl } from '../controllers/googleAuthController.js';
import { lockDataMode, resetDataMode, useDb } from '../lib/dataMode.js';
import {
  claimIdempotent,
  clearIdempotencyMemory,
  completeIdempotent,
  createIdempotencyContext,
} from '../lib/idempotency.js';
import { emailVerifiedOnRegister, mustVerifyEmail } from '../lib/accountPolicy.js';
import { shouldSkipAudit } from '../middleware/auditMutations.js';

afterEach(() => {
  clearIdempotencyMemory();
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
  function context({ path = '/api/slots/slot-1/book', body = {}, role = 'mentee' } = {}) {
    return createIdempotencyContext({
      method: 'PATCH',
      originalUrl: path,
      body,
      user: { userId: 'user-1', role },
      get: (name) => (name === 'Idempotency-Key' ? 'key-1' : undefined),
    });
  }

  beforeEach(() => lockDataMode('memory'));

  it('atomically reserves and replays a completed response', async () => {
    const request = context();
    await expect(claimIdempotent(request)).resolves.toMatchObject({ kind: 'claimed' });
    await expect(claimIdempotent(request)).resolves.toMatchObject({ kind: 'pending' });
    await completeIdempotent(request, 200, { _id: 'slot-1' });
    await expect(claimIdempotent(request)).resolves.toMatchObject({
      kind: 'replay',
      status: 200,
      body: { _id: 'slot-1' },
    });
  });

  it('rejects key reuse with a different payload or authorization context', async () => {
    const request = context({ body: { menteeId: 'mentee-1' } });
    await claimIdempotent(request);
    await completeIdempotent(request, 200, { _id: 'slot-1' });

    await expect(
      claimIdempotent(context({ body: { menteeId: 'mentee-2' } }))
    ).resolves.toMatchObject({ kind: 'conflict', reason: 'payload' });
    await expect(
      claimIdempotent(context({ body: { menteeId: 'mentee-1' }, role: 'admin' }))
    ).resolves.toMatchObject({ kind: 'conflict', reason: 'authorization' });
  });

  it('scopes the same key independently per endpoint', async () => {
    await expect(claimIdempotent(context())).resolves.toMatchObject({ kind: 'claimed' });
    await expect(
      claimIdempotent(context({ path: '/api/slots/slot-2/book' }))
    ).resolves.toMatchObject({ kind: 'claimed' });
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

describe('account policy', () => {
  it('blocks unverified sign-in only when mail can be sent', () => {
    expect(mustVerifyEmail({ emailVerified: false }, true)).toBe(true);
    expect(mustVerifyEmail({ emailVerified: true }, true)).toBe(false);
    expect(mustVerifyEmail({ emailVerified: false }, false)).toBe(false);
  });

  it('treats an invite as a verified address', () => {
    expect(emailVerifiedOnRegister({ invited: true, mailConfigured: true })).toBe(true);
    expect(emailVerifiedOnRegister({ invited: false, mailConfigured: true })).toBe(false);
    expect(emailVerifiedOnRegister({ invited: false, mailConfigured: false })).toBe(true);
  });

  it('keeps password changes in the audit log and skips login noise', () => {
    expect(shouldSkipAudit('/api/auth/login')).toBe(true);
    expect(shouldSkipAudit('/api/auth/change-password')).toBe(false);
    expect(shouldSkipAudit('/api/auth/account')).toBe(false);
  });
});

describe('account self-service', () => {
  const app = createApp({ mountSpa: false });

  async function adminToken() {
    const login = await request(app).post('/api/auth/login').send({
      email: 'admin@example.com',
      password: 'AdminPass123',
    });
    return login.body?.data?.accessToken;
  }

  it('refuses to change or delete the demo account and still exports it', async () => {
    const token = await adminToken();
    const changed = await request(app)
      .post('/api/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'AdminPass123', password: 'NewPass123', confirmPassword: 'NewPass123' });
    expect(changed.status).toBe(403);
    expect(changed.body.code).toBe('DEMO_ACCOUNT');

    const removed = await request(app)
      .delete('/api/auth/account')
      .set('Authorization', `Bearer ${token}`)
      .send({ password: 'AdminPass123' });
    expect(removed.status).toBe(403);
    expect(removed.body.code).toBe('DEMO_ACCOUNT');

    const exported = await request(app)
      .get('/api/auth/export')
      .set('Authorization', `Bearer ${token}`);
    expect(exported.status).toBe(200);
    expect(exported.body.data.profile.email).toBe('admin@example.com');
  });

  it('replays an invite when the same idempotency key is sent twice', async () => {
    lockDataMode('memory');
    const token = await adminToken();
    const email = `invite-${Date.now()}@example.com`;
    const send = () =>
      request(app)
        .post('/api/invites')
        .set('Authorization', `Bearer ${token}`)
        .set('Idempotency-Key', 'invite-once')
        .send({ email, role: 'mentee' });
    const first = await send();
    const second = await send();
    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    expect(second.body.token).toBe(first.body.token);
  });

  it('rejects an idempotency key reused with another invite payload', async () => {
    lockDataMode('memory');
    const token = await adminToken();
    const send = (email) =>
      request(app)
        .post('/api/invites')
        .set('Authorization', `Bearer ${token}`)
        .set('Idempotency-Key', 'invite-payload-bound')
        .send({ email, role: 'mentee' });

    expect((await send(`first-${Date.now()}@example.com`)).status).toBe(201);
    const reused = await send(`second-${Date.now()}@example.com`);
    expect(reused.status).toBe(409);
    expect(reused.body.code).toBe('IDEMPOTENCY_KEY_REUSED');
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
