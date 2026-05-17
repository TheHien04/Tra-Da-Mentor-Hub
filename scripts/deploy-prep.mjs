#!/usr/bin/env node
/**
 * One-shot pre-deploy: build, test, generate Railway env, optional Docker smoke.
 * Usage: npm run deploy:prep
 *        npm run deploy:prep -- --database-url "mongodb+srv://..."
 */
import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const envFile = path.join(root, 'deploy', 'railway.env.generated');

function run(cmd, args, extraEnv = {}) {
  console.log(`\n▶ ${cmd} ${args.join(' ')}`);
  const r = spawnSync(cmd, args, {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, ...extraEnv },
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

const args = process.argv.slice(2);
const dbIdx = args.indexOf('--database-url');
const dbUrl = dbIdx >= 0 ? args[dbIdx + 1] : '';

console.log('\n🚀 Trà Đá Mentor — deploy prep\n');

run('node', ['scripts/setup-production.mjs', ...(dbUrl ? ['--database-url', dbUrl] : [])]);
run('npm', ['run', 'build']);
run('npm', ['run', 'test:unit']);

if (fs.existsSync(envFile)) {
  const content = fs.readFileSync(envFile, 'utf8');
  const env = {};
  for (const line of content.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq === -1) continue;
    env[t.slice(0, eq).trim()] = t.slice(eq + 1).trim();
  }

  if (env.DATABASE_URL && !env.DATABASE_URL.includes('USER:PASS')) {
    run('node', ['scripts/verify-production-env.mjs'], {
      NODE_ENV: 'production',
      ...env,
    });
  } else {
    console.log('\n⚠️  Chưa có DATABASE_URL thật — bỏ qua verify production.');
    console.log('   Chạy lại: npm run deploy:prep -- --database-url "mongodb+srv://..."\n');
  }
}

const docker = spawnSync('docker', ['info'], { stdio: 'ignore' });
if (docker.status === 0) {
  console.log('\n▶ docker build (kiểm tra image production)...');
  const build = spawnSync('docker', ['build', '-t', 'tra-da-mentor:local', '.'], {
    cwd: root,
    stdio: 'inherit',
  });
  if (build.status === 0) {
    console.log('\n✅ Docker image OK: tra-da-mentor:local');
    console.log('   Test local: docker run --rm -p 5000:5000 --env-file deploy/railway.env.generated tra-da-mentor:local');
  }
} else {
  console.log('\n○ Docker không chạy — bỏ qua build image (Railway vẫn build trên cloud).');
}

console.log('\n══════════════════════════════════════════════════════════');
console.log('  BƯỚC CỦA BẠN (2 phút trên trình duyệt)');
console.log('══════════════════════════════════════════════════════════');
console.log('\n1. Atlas → https://www.mongodb.com/cloud/atlas');
console.log('   • Tạo cluster M0, user DB, Network 0.0.0.0/0');
console.log('   • Copy connection string → thay <password>');
console.log('\n2. Railway → https://railway.app → New Project → GitHub repo');
console.log('   • Settings → Networking → Generate Domain');
console.log('   • Variables → RAW Editor → dán file:');
console.log(`     ${path.relative(root, envFile)}`);
console.log('   • Thêm/sửa dòng DATABASE_URL=... từ Atlas');
console.log('   • Deploy (hoặc push code lên main)');
console.log('\n3. Mở: https://<domain>.up.railway.app/api/health');
console.log('   → status ok, storage mongodb');
console.log('\n4. Đăng ký tài khoản mới tại /register (demo admin đã tắt)');
console.log('\n📄 Chi tiết: DEPLOY.md\n');
