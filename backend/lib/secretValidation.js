/**
 * Production secret strength checks
 */

const WEAK_MARKERS = [
  'change_this',
  'change-me',
  'your-',
  'example.com',
  'localhost',
  'password',
  'secret',
  'tra-da',
  'tradamentor',
];

export function isWeakSecret(value, minLength = 32) {
  if (!value || typeof value !== 'string') return true;
  if (value.length < minLength) return true;
  const lower = value.toLowerCase();
  return WEAK_MARKERS.some((marker) => lower.includes(marker));
}

export function assertProductionSecrets(env) {
  if (!env.isProduction) return;

  for (const key of ['JWT_SECRET', 'JWT_REFRESH_SECRET']) {
    const value = process.env[key];
    if (isWeakSecret(value, 48)) {
      console.error(
        `❌ PRODUCTION ERROR: ${key} is missing, too short, or looks like a placeholder.\n` +
          `   Generate with: openssl rand -hex 64`
      );
      process.exit(1);
    }
  }

  if (process.env.JWT_SECRET === process.env.JWT_REFRESH_SECRET) {
    console.error('❌ PRODUCTION ERROR: JWT_SECRET and JWT_REFRESH_SECRET must be different.');
    process.exit(1);
  }

  if (process.env.ENABLE_DEMO_AUTH === 'true') {
    console.error(
      '❌ PRODUCTION ERROR: ENABLE_DEMO_AUTH must not be "true" in production (demo admin account).'
    );
    process.exit(1);
  }
}
