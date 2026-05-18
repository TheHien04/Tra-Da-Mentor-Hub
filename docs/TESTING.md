# Testing guide

## Quick commands

| Command | Purpose |
| ------- | ------- |
| `npm run test:unit` | All Jest tests (unit + integration; Mongo for CRM/admin suites) |
| `npm run test:unit:ci` | Same + coverage thresholds |
| `npm run test:frontend` | Vitest (`src/**/*.test.ts`) |
| `npm run test:e2e` | Playwright (needs API + frontend; see `playwright.config.ts`) |
| `npm run quality` | Local quality gate (build, tests, locales, OpenAPI, secrets) |

## MongoDB for integration tests

CRM and admin API tests use `TEST_DATABASE_URL` (default `mongodb://127.0.0.1:27017/tra-da-mentor-test`).

```bash
# Docker
docker run -d -p 27017:27017 --name tra-da-mongo mongo:7

export TEST_DATABASE_URL=mongodb://127.0.0.1:27017/tra-da-mentor-test
export ENABLE_DEMO_AUTH=true
export JWT_SECRET=local-dev-jwt-secret-minimum-sixty-four-characters-long-for-testing-only
export JWT_REFRESH_SECRET=local-dev-jwt-refresh-secret-minimum-sixty-four-characters-long
npm run test:unit:ci
```

Tests without Mongo still run: health, OpenAPI docs, in-memory store unit tests.

## Coverage

- **Backend:** Jest collects coverage on core modules listed in `jest.config.json` (thresholds enforced in CI).
- **Frontend:** Vitest coverage via `npm run test:frontend:ci` (thresholds in `vite.config.ts`).

## E2E

1. Start Mongo + API + Vite (`npm run dev:all`) or use Playwright `webServer` config.
2. `npm run test:e2e:install` once for Chromium.
3. `npm run test:e2e`

## Writing new API tests

Use `backend/__tests__/helpers/mongoTest.js`:

```js
import { getTestApp, connectTestMongo, loginAsAdmin } from './helpers/mongoTest.js';
```

Mount app with `createApp({ mountSpa: false })` and call routes with Supertest + `Authorization: Bearer`.
