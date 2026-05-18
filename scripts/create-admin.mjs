#!/usr/bin/env node
/**
 * Create production admin user (does not delete existing data).
 * Usage: node scripts/create-admin.mjs admin@your.org "Admin Name" 'SecurePass123!'
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import env from '../backend/config/env.js';
import User from '../backend/models/User.js';

const [email, name, password] = process.argv.slice(2);

if (!email || !name || !password) {
  console.error('Usage: node scripts/create-admin.mjs <email> <name> <password>');
  process.exit(1);
}

if (password.length < 8) {
  console.error('Password must be at least 8 characters');
  process.exit(1);
}

await mongoose.connect(env.databaseUrl);
const existing = await User.findOne({ email: email.toLowerCase() });
if (existing) {
  console.error(`User already exists: ${email}`);
  process.exit(1);
}

const hash = await bcrypt.hash(password, 10);
const user = await User.create({
  email: email.toLowerCase(),
  password: hash,
  name,
  role: 'admin',
  emailVerified: true,
});

console.log('✅ Admin created:', user.email, user._id.toString());
await mongoose.disconnect();
