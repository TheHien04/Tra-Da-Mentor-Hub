import { defineConfig, devices } from '@playwright/test';

const webPort = Number(process.env.E2E_WEB_PORT || 4173);
const apiPort = Number(process.env.E2E_API_PORT || 5002);
const webBase = `http://localhost:${webPort}`;
const apiBase = `http://localhost:${apiPort}`;
const e2eEnv = {
  ...process.env,
  PORT: String(apiPort),
  HOST: '127.0.0.1',
  CORS_ORIGIN: webBase,
  FRONTEND_URL: webBase,
  BASE_URL: apiBase,
  VITE_PORT: String(webPort),
  VITE_API_URL: '/api',
  VITE_SOCKET_URL: '',
  VITE_DEV_API_TARGET: apiBase,
  DATABASE_URL:
    process.env.E2E_DATABASE_URL ||
    process.env.DATABASE_URL ||
    'mongodb://127.0.0.1:27017/tra-da-mentor-e2e',
};

// Make the same resolved endpoint available to test helpers.
process.env.E2E_API_BASE = `${apiBase}/api`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : 2,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: webBase,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      testIgnore: /cross-browser\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      testMatch: /cross-browser\.spec\.ts/,
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      testMatch: /cross-browser\.spec\.ts/,
      use: { ...devices['Desktop Safari'] },
    },
  ],
  // Wait for both processes independently. Waiting only for Vite made the first
  // login test race the API bootstrap on cold starts.
  webServer: [
    {
      command: `npm run dev -- --host 127.0.0.1 --port ${webPort}`,
      url: webBase,
      reuseExistingServer: false,
      timeout: 120_000,
      env: e2eEnv,
    },
    {
      command: 'npm run dev:server',
      url: `${apiBase}/api/health`,
      reuseExistingServer: false,
      timeout: 120_000,
      env: e2eEnv,
    },
  ],
});
