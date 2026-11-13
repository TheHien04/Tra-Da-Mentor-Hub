import { expect, test, type APIRequestContext } from '@playwright/test';
import { API_BASE } from './helpers';

const p95BudgetMs = Number(process.env.PERFORMANCE_P95_MS || 750);

function percentile95(samples: number[]) {
  const sorted = [...samples].sort((a, b) => a - b);
  return sorted[Math.max(0, Math.ceil(sorted.length * 0.95) - 1)];
}

async function measure(request: APIRequestContext, path: string, count: number) {
  const samples: number[] = [];
  for (let index = 0; index < count; index += 1) {
    const started = performance.now();
    const response = await request.get(`${API_BASE}${path}`);
    samples.push(performance.now() - started);
    expect(response.ok()).toBeTruthy();
  }
  return samples;
}

test.describe('Performance smoke budgets', () => {
  test('liveness and readiness stay within the local p95 budget', async ({ request }) => {
    // Warm the process before measuring so startup cost is not confused with request latency.
    expect((await request.get(`${API_BASE}/health`)).ok()).toBeTruthy();
    const health = await measure(request, '/health', 20);
    const ready = await measure(request, '/ready', 20);

    expect(percentile95(health), `health p95 exceeded ${p95BudgetMs}ms`).toBeLessThan(p95BudgetMs);
    expect(percentile95(ready), `ready p95 exceeded ${p95BudgetMs}ms`).toBeLessThan(p95BudgetMs);
  });
});
