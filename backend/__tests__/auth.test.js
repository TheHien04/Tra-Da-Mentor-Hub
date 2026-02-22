// backend/__tests__/auth.test.js
/**
 * Authentication API Integration Tests
 * Tests login, register, logout, refresh token
 */

import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import authRoutes from '../routes/auth.js';
import { errorHandler } from '../middleware/errorHandler.js';

// Create test app
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use(errorHandler);

// Test database URL
const TEST_DB_URL = process.env.TEST_DATABASE_URL || 'mongodb://localhost:27017/tra-da-mentor-test';

describe('Authentication API', () => {
  let testUser;
  let accessToken;
  let refreshToken;

  // Connect to test database before all tests
  beforeAll(async () => {
    await mongoose.connect(TEST_DB_URL);
  });

  // Clear database before each test
  beforeEach(async () => {
    await User.deleteMany({});
  });

  // Close database connection after all tests
  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Test123456',
          name: 'Test User',
          role: 'mentee',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    it('should fail with duplicate email', async () => {
      // Create user first
      await User.create({
        email: 'test@example.com',
        password: 'Test123456',
        name: 'Test User',
        role: 'mentee',
      });

      // Try to register with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Test123456',
          name: 'Another User',
          role: 'mentee',
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already registered');
    });

    it('should fail with missing required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          // Missing password and name
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create test user
      testUser = await User.create({
        email: 'test@example.com',
        password: 'Test123456',
        name: 'Test User',
        role: 'mentee',
      });
    });

    it('should login with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Test123456',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();

      // Save tokens for other tests
      accessToken = response.body.data.accessToken;
      refreshToken = response.body.data.refreshToken;
    });

    it('should fail with wrong password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });

    it('should fail with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Test123456',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/refresh', () => {
    beforeEach(async () => {
      // Create user and login to get tokens
      testUser = await User.create({
        email: 'test@example.com',
        password: 'Test123456',
        name: 'Test User',
        role: 'mentee',
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Test123456',
        });

      refreshToken = loginResponse.body.data.refreshToken;
    });

    it('should refresh access token with valid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
    });

    it('should fail with invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken: 'invalid_token',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/logout', () => {
    beforeEach(async () => {
      // Create user and login
      testUser = await User.create({
        email: 'test@example.com',
        password: 'Test123456',
        name: 'Test User',
        role: 'mentee',
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Test123456',
        });

      accessToken = loginResponse.body.data.accessToken;
      refreshToken = loginResponse.body.data.refreshToken;
    });

    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          refreshToken,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/auth/profile', () => {
    beforeEach(async () => {
      // Create user and login
      testUser = await User.create({
        email: 'test@example.com',
        password: 'Test123456',
        name: 'Test User',
        role: 'mentee',
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Test123456',
        });

      accessToken = loginResponse.body.data.accessToken;
    });

    it('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('test@example.com');
    });

    it('should fail without token', async () => {
      const response = await request(app).get('/api/auth/profile');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
