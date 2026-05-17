#!/usr/bin/env node
/**
 * Fail if git tracks files that should stay local (pre-push safety).
 * Usage: node scripts/check-secrets-not-tracked.mjs
 */
import { execSync } from 'child_process';

const BLOCKED_PATTERNS = [
  /^\.env$/,
  /^\.env\.(?!example$|test\.example$)/,
  /^deploy\/.*\.generated$/,
  /^deploy\/railway\.env$/,
  /^test-results\//,
  /^dist\//,
  /^node_modules\//,
  /\.pem$/,
  /credentials\.json$/,
];

const tracked = execSync('git ls-files', { encoding: 'utf8' })
  .trim()
  .split('\n')
  .filter(Boolean);

const violations = tracked.filter((file) =>
  BLOCKED_PATTERNS.some((re) => re.test(file))
);

if (violations.length) {
  console.error('❌ These files must NOT be committed:\n');
  violations.forEach((f) => console.error(`   - ${f}`));
  console.error('\nRun: git rm --cached <file> and check .gitignore\n');
  process.exit(1);
}

console.log('✅ No blocked secret/artifact paths are tracked by git.');
