/**
 * Shared MongoDB test harness for API integration suites.
 */
import mongoose from 'mongoose';
import { createApp } from '../../createApp.js';
import request from 'supertest';

export const TEST_DB_URL =
  process.env.TEST_DATABASE_URL || 'mongodb://127.0.0.1:27017/tra-da-mentor-test';

let appInstance = null;

export function getTestApp() {
  if (!appInstance) {
    appInstance = createApp({ mountSpa: false });
  }
  return appInstance;
}

export async function connectTestMongo() {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(TEST_DB_URL);
}

export async function disconnectTestMongo() {
  if (mongoose.connection.readyState === 0) return;
  await mongoose.disconnect();
}

export async function clearTestCollections() {
  if (mongoose.connection.readyState !== 1) return;
  const collections = await mongoose.connection.db.collections();
  await Promise.all(
    collections.map((c) => c.deleteMany({}))
  );
}

export async function loginAsAdmin() {
  const app = getTestApp();
  const res = await request(app).post('/api/auth/login').send({
    email: 'admin@example.com',
    password: 'AdminPass123',
  });
  if (res.status !== 200) {
    throw new Error(`Admin login failed: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return res.body.data.accessToken;
}
