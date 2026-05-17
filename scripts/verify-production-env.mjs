#!/usr/bin/env node
/**
 * Validates required production environment variables before deploy.
 * Usage: NODE_ENV=production node scripts/verify-production-env.mjs
 * Loads .env via dotenv if present.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const envPath = path.join(root, '.env');

if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}

const isProd = (process.env.NODE_ENV || '') === 'production';
const hasPlatformUrl =
  process.env.RAILWAY_PUBLIC_DOMAIN ||
  process.env.RAILWAY_STATIC_URL ||
  process.env.RENDER_EXTERNAL_URL ||
  process.env.FLY_APP_NAME;
const required = isProd
  ? ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'DATABASE_URL']
  : [];
if (isProd && !hasPlatformUrl && !process.env.CORS_ORIGIN) {
  required.push('CORS_ORIGIN');
}

const recommended = [
  'SENDGRID_API_KEY',
  'STRIPE_SECRET_KEY',
  'GOOGLE_CLIENT_ID',
  'BASE_URL',
  'FRONTEND_URL',
];

const weak = [
  'CHANGE_THIS',
  'change-me',
  'your-',
  'example.com',
  'localhost',
];

function isWeak(value) {
  if (!value || value.length < 32) return true;
  const lower = value.toLowerCase();
  return weak.some((w) => lower.includes(w));
}

let failed = false;

for (const key of required) {
  if (!process.env[key]) {
    console.error(`❌ Missing required: ${key}`);
    failed = true;
  }
}

if (isProd && process.env.ENABLE_DEMO_AUTH === 'true') {
  console.error('❌ ENABLE_DEMO_AUTH must not be true in production');
  failed = true;
}

if (isProd && process.env.JWT_SECRET && process.env.JWT_REFRESH_SECRET) {
  if (process.env.JWT_SECRET === process.env.JWT_REFRESH_SECRET) {
    console.error('❌ JWT_SECRET and JWT_REFRESH_SECRET must be different');
    failed = true;
  }
}

for (const key of ['JWT_SECRET', 'JWT_REFRESH_SECRET']) {
  if (process.env[key] && isWeak(process.env[key])) {
    console.error(`❌ ${key} looks weak or placeholder — use: openssl rand -hex 64`);
    failed = true;
  }
}

if (!fs.existsSync(path.join(root, 'dist', 'index.html')) && isProd) {
  console.warn('⚠️  dist/ not found — run npm run build before npm start');
}

console.log('\n📋 Optional integrations:');
for (const key of recommended) {
  console.log(`   ${process.env[key] ? '✅' : '○'} ${key}`);
}

if (failed) {
  process.exit(1);
}

console.log('\n✅ Production environment check passed');
