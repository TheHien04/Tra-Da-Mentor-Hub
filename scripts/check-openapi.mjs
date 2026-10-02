import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const specPath = 'docs/openapi.json';
const typesPath = 'src/types/openapi.ts';
const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));

const requiredSchemas = [
  'Error',
  'Mentor',
  'Mentee',
  'Group',
  'Slot',
  'SessionLog',
  'Notification',
  'Invite',
  'Testimonial',
  'MatchSuggestion',
  'PagedMentors',
];
const requiredPaths = [
  '/api/auth/refresh',
  '/api/mentors',
  '/api/mentees',
  '/api/groups',
  '/api/slots/{id}/booking',
  '/api/notifications',
  '/api/matching/suggestions',
  '/api/uploads/avatar',
  '/api/analytics/summary',
];

for (const name of requiredSchemas) {
  if (!spec.components?.schemas?.[name]) {
    console.error(`openapi.json missing schema ${name}`);
    process.exit(1);
  }
}
if (!spec.components.schemas.Error.properties?.code) {
  console.error('Error schema must include code');
  process.exit(1);
}
for (const route of requiredPaths) {
  if (!spec.paths?.[route]) {
    console.error(`openapi.json missing path ${route}`);
    process.exit(1);
  }
}

const tmp = path.join(os.tmpdir(), 'openapi.generated.ts');
execFileSync(
  path.resolve('node_modules/.bin/openapi-typescript'),
  [specPath, '-o', tmp],
  { stdio: 'inherit' }
);
const current = fs.readFileSync(typesPath, 'utf8');
const next = fs.readFileSync(tmp, 'utf8');
if (current !== next) {
  console.error('src/types/openapi.ts is stale. Run npm run generate:api');
  process.exit(1);
}

console.log('openapi.json OK');
