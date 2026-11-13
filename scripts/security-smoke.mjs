#!/usr/bin/env node
/**
 * Validate security properties exposed by a running API.
 */
const baseUrl = (process.env.BASE_URL || 'http://127.0.0.1:5002').replace(/\/+$/, '');
const trustedOrigin = process.env.SECURITY_SMOKE_TRUSTED_ORIGIN || 'http://localhost:5000';
const untrustedOrigin = process.env.SECURITY_SMOKE_ORIGIN || 'https://untrusted.example';

try {
  const response = await fetch(`${baseUrl}/api/health`, {
    headers: { Accept: 'application/json', Origin: trustedOrigin },
  });
  const body = await response.json().catch(() => null);
  const requiredHeaders = [
    'content-security-policy',
    'x-content-type-options',
    'referrer-policy',
    'cross-origin-resource-policy',
  ];
  const missingHeaders = requiredHeaders.filter((header) => !response.headers.get(header));
  const allowOrigin = response.headers.get('access-control-allow-origin');
  const serializedBody = JSON.stringify(body || {});

  if (response.status !== 200) throw new Error(`/api/health returned HTTP ${response.status}`);
  if (missingHeaders.length) throw new Error(`Missing security headers: ${missingHeaders.join(', ')}`);
  if (allowOrigin !== trustedOrigin) {
    throw new Error(`Trusted origin was not granted CORS access: ${allowOrigin}`);
  }
  if (/password|token|secret|api[-_]?key/i.test(serializedBody)) {
    throw new Error('Health response appears to contain a secret-like field.');
  }

  const untrustedResponse = await fetch(`${baseUrl}/api/health`, {
    headers: { Accept: 'application/json', Origin: untrustedOrigin },
  });
  if (untrustedResponse.headers.get('access-control-allow-origin') === untrustedOrigin) {
    throw new Error(`Untrusted origin received a CORS grant: ${untrustedOrigin}`);
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        baseUrl,
        trustedOrigin,
        untrustedOrigin,
        headers: requiredHeaders,
        corsOrigin: allowOrigin || 'not-present',
      },
      null,
      2
    )
  );
} catch (error) {
  console.error(`✗ Security smoke failed for ${baseUrl}: ${error.message}`);
  process.exit(1);
}
