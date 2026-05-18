#!/usr/bin/env node
/**
 * Local quality gate — mirrors CI checks.
 */
import { spawnSync } from 'node:child_process';

const steps = [
  ['check:secrets', 'Secrets not tracked'],
  ['check:openapi', 'OpenAPI JSON valid'],
  ['build', 'Typecheck + frontend build'],
  ['lint', 'ESLint'],
  ['test:unit:ci', 'Backend unit + integration + coverage'],
  ['test:frontend:ci', 'Frontend unit + coverage'],
  ['check:locales', 'Locale parity'],
];

let failed = false;

for (const [script, label] of steps) {
  console.log(`\n▶ ${label} (npm run ${script})`);
  const r = spawnSync('npm', ['run', script], { stdio: 'inherit', shell: true });
  if (r.status !== 0) {
    console.error(`✗ Failed: ${script}`);
    failed = true;
    break;
  }
  console.log(`✓ ${label}`);
}

if (failed) {
  process.exit(1);
}
console.log('\n✓ Quality gate passed');
