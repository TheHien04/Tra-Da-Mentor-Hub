import env from '../config/env.js';

/** Local delivery for the demo when vendor keys are not configured. Production stays off. */
export function demoIntegrationsEnabled() {
  if (env.isProduction) return false;
  if (process.env.ENABLE_DEMO_INTEGRATIONS === 'false') return false;
  return process.env.ENABLE_DEMO_AUTH !== 'false';
}
