import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localesDir = path.join(__dirname, '../src/i18n/locales');

function deepMerge(target, source) {
  const out = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      target[key] &&
      typeof target[key] === 'object'
    ) {
      out[key] = deepMerge(target[key], source[key]);
    } else if (!(key in target)) {
      out[key] = source[key];
    }
  }
  return out;
}

const en = JSON.parse(fs.readFileSync(path.join(localesDir, 'en.json'), 'utf8'));

for (const lang of ['jp', 'kr', 'cn']) {
  const file = path.join(localesDir, `${lang}.json`);
  const existing = JSON.parse(fs.readFileSync(file, 'utf8'));
  const merged = deepMerge(existing, en);
  fs.writeFileSync(file, JSON.stringify(merged, null, 2) + '\n');
  console.log(`Merged ${lang}.json`);
}
