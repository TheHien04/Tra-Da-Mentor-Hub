import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localesDir = path.join(__dirname, '../src/i18n/locales');

function flatten(obj, prefix = '') {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(out, flatten(v, key));
    } else {
      out[key] = true;
    }
  }
  return out;
}

const en = JSON.parse(fs.readFileSync(path.join(localesDir, 'en.json'), 'utf8'));
const enKeys = flatten(en);
let failed = false;

for (const lang of ['vi', 'jp', 'kr', 'cn']) {
  const file = path.join(localesDir, `${lang}.json`);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const keys = flatten(data);
  const missing = Object.keys(enKeys).filter((k) => !(k in keys));
  if (missing.length > 0) {
    failed = true;
    console.error(`${lang}.json missing ${missing.length} keys (e.g. ${missing.slice(0, 5).join(', ')})`);
  } else {
    console.log(`${lang}.json OK (${Object.keys(keys).length} keys)`);
  }
}

if (failed) process.exit(1);
