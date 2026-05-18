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
