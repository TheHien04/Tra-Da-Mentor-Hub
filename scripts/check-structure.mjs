#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const failures = [];
const text = (path) => readFileSync(path, 'utf8');
const lines = (path) => text(path).split(/\r?\n/).length;

const requiredDirectories = [
  'src/app',
  'src/pages',
  'src/components/ui',
  'src/content',
  'src/hooks/queries',
  'src/services/api',
  'backend/controllers',
  'backend/routes',
  'backend/services',
];

for (const directory of requiredDirectories) {
  try {
    if (!statSync(directory).isDirectory()) failures.push(`${directory} must be a directory`);
  } catch {
    failures.push(`Missing required directory: ${directory}`);
  }
}

const sizeBudgets = [
  ['src/App.tsx', 80, 'App.tsx is a composition root'],
  ['backend/createApp.js', 180, 'createApp.js is a composition root'],
  ['src/services/api.ts', 30, 'services/api.ts is a public barrel'],
];

for (const [path, max, reason] of sizeBudgets) {
  if (lines(path) > max) failures.push(`${path} exceeds ${max} lines (${reason})`);
}

for (const name of readdirSync('backend/routes')) {
  if (!name.endsWith('.js')) continue;
  const path = join('backend/routes', name);
  if (lines(path) > 180) failures.push(`${path} exceeds the route-layer budget; extract a controller`);
}

const routeSource = text('src/app/AppRoutes.tsx');
const lazyImports = [...routeSource.matchAll(/import\('([^']+)'\)/g)].map((match) => match[1]);
for (const path of lazyImports) {
  if (!path.startsWith('../pages/') && path !== '../components/NotFound') {
    failures.push(`Route screen must live in src/pages: ${path}`);
  }
}

const productContent = text('src/content/officialProgram.ts');
for (const requiredSource of ['https://www.tradamentor.com/dich-vu', 'https://forms.gle/']) {
  if (!productContent.includes(requiredSource)) {
    failures.push(`Official program catalogue must retain canonical source: ${requiredSource}`);
  }
}

if (failures.length) {
  console.error('Structure check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Structure OK: ${lazyImports.length} route screens, declarative backend routes, focused composition roots.`);
