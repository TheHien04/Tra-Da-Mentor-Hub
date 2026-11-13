#!/usr/bin/env node
/** Small, repeatable HTTP budget check for staging or a local server. */
const baseUrl = (process.env.LOAD_TEST_URL || 'http://127.0.0.1:5000/api/health').replace(/\/$/, '');
const total = Math.max(1, Number(process.env.LOAD_TEST_REQUESTS || 100));
const concurrency = Math.max(1, Math.min(total, Number(process.env.LOAD_TEST_CONCURRENCY || 10)));
const budget = Number(process.env.LOAD_TEST_P95_MS || 750);
const samples = [];

async function one() {
  const started = performance.now();
  const response = await fetch(baseUrl);
  const elapsed = performance.now() - started;
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  samples.push(elapsed);
}

for (let completed = 0; completed < total; completed += concurrency) {
  const batch = Array.from({ length: Math.min(concurrency, total - completed) }, one);
  await Promise.all(batch);
}

samples.sort((a, b) => a - b);
const p95 = samples[Math.ceil(samples.length * 0.95) - 1] || 0;
const average = samples.reduce((sum, value) => sum + value, 0) / samples.length;
console.log(JSON.stringify({ url: baseUrl, requests: total, concurrency, averageMs: Number(average.toFixed(2)), p95Ms: Number(p95.toFixed(2)), budgetMs: budget }));
if (p95 > budget) {
  console.error(`p95 ${p95.toFixed(2)}ms exceeds ${budget}ms`);
  process.exit(1);
}
