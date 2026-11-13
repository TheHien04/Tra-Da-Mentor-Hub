/**
 * HTTP integration tests (no DB required for health/docs).
 */
import request from 'supertest';
import { createApp } from '../createApp.js';

const app = createApp({ mountSpa: false });

describe('API integration', () => {
  describe('GET /api/health', () => {
    it('returns JSON health payload', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBeLessThanOrEqual(503);
      expect(res.body).toHaveProperty('status');
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body).toHaveProperty('storage');
      expect(res.body.check).toBe('liveness');
      expect(res.headers['x-request-id']).toBeTruthy();
    });

    it('preserves a safe caller request ID for tracing', async () => {
      const res = await request(app).get('/api/health').set('X-Request-ID', 'test-request-123');
      expect(res.headers['x-request-id']).toBe('test-request-123');
    });

    it('exposes a readiness probe', async () => {
      const res = await request(app).get('/api/ready');
      expect(res.status).toBeLessThanOrEqual(503);
      expect(res.body.check).toBe('readiness');
    });
  });

  describe('GET /api/docs', () => {
    it('serves OpenAPI JSON', async () => {
      const res = await request(app).get('/api/docs/openapi.json');
      expect(res.status).toBe(200);
      expect(res.body.openapi).toMatch(/^3\./);
      expect(res.body.info.title).toContain('Mentor');
    });

    it('serves Swagger UI HTML', async () => {
      const res = await request(app).get('/api/docs/');
      expect(res.status).toBe(200);
      expect(res.text).toMatch(/swagger/i);
    });
  });

  describe('Protected routes', () => {
    it('rejects unauthenticated mentors list', async () => {
      const res = await request(app).get('/api/mentors');
      expect(res.status).toBe(401);
    });
  });
});
