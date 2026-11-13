#!/usr/bin/env node
/**
 * Validate the externally observable service contract.
 *
 * BASE_URL points at the running API. Readiness is intentionally strict:
 * a dependency-degraded response is an operational failure for a release.
 */
const baseUrl = (process.env.BASE_URL || 'http://127.0.0.1:5000').replace(/\/+$/, '');
const timeoutMs = Number(process.env.OPERATIONS_TIMEOUT_MS || 5000);

async function check(path, expectedStatus) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    const body = await response.json().catch(() => null);

    if (response.status !== expectedStatus) {
      throw new Error(
        `${path} returned HTTP ${response.status}; expected ${expectedStatus}. ` +
          `Payload: ${JSON.stringify(body).slice(0, 300)}`
      );
    }

    if (!body || typeof body !== 'object') {
      throw new Error(`${path} did not return a JSON object.`);
    }

    return body;
  } finally {
    clearTimeout(timeout);
  }
}

try {
  const health = await check('/api/health', 200);
  const ready = await check('/api/ready', 200);
  console.log(
    JSON.stringify(
      {
        ok: true,
        baseUrl,
        healthStatus: health.status,
        readinessStatus: ready.status,
      },
      null,
      2
    )
  );
} catch (error) {
  const message = error?.name === 'AbortError' ? `timed out after ${timeoutMs}ms` : error.message;
  console.error(`✗ Operational smoke failed for ${baseUrl}: ${message}`);
  process.exit(1);
}
