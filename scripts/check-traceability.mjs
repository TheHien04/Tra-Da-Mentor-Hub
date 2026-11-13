#!/usr/bin/env node
import { access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const matrixPath = resolve(root, 'docs/traceability.json');
const matrix = JSON.parse(await (await import('node:fs/promises')).readFile(matrixPath, 'utf8'));

if (!Number.isInteger(matrix.version) || matrix.version < 1 || !Array.isArray(matrix.requirements)) {
  throw new Error('Traceability matrix must contain a numeric version and requirements array.');
}

const ids = new Set();
const failures = [];

for (const requirement of matrix.requirements) {
  if (!requirement.id || ids.has(requirement.id)) {
    failures.push(`Duplicate or missing requirement id: ${requirement.id || '<missing>'}`);
  }
  ids.add(requirement.id);

  for (const field of ['outcome', 'owner', 'acceptance', 'evidence', 'uatRoles']) {
    if (!requirement[field] || (Array.isArray(requirement[field]) && requirement[field].length === 0)) {
      failures.push(`${requirement.id}: missing ${field}`);
    }
  }

  for (const relativePath of requirement.evidence || []) {
    try {
      await access(resolve(root, relativePath));
    } catch {
      failures.push(`${requirement.id}: evidence file does not exist: ${relativePath}`);
    }
  }
}

if (failures.length > 0) {
  console.error('✗ Traceability check failed');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`✓ Traceability check passed (${matrix.requirements.length} requirements)`);
