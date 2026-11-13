# Testing guide

## Quick commands

| Command | Purpose |
| ------- | ------- |
| `npm run test:unit` | All Jest tests (unit + integration; Mongo for CRM/admin suites) |
| `npm run test:unit:ci` | Same + coverage thresholds |
| `npm run test:frontend` | Vitest (`src/**/*.test.ts`) |
| `npm run test:e2e` | Playwright (needs API + frontend; see `playwright.config.ts`) |
| `npm run test:e2e:crossbrowser` | Firefox + WebKit compatibility contract |
| `npm run test:load` | Configurable HTTP p95 smoke budget (`LOAD_TEST_URL`, requests, concurrency) |
| `npm run test:ops` | Liveness/readiness contract against a running API (`BASE_URL`) |
| `npm run test:security-smoke` | Runtime security headers, CORS boundary, and health redaction check against a running API (`BASE_URL`) |
| `npm run check:traceability` | Validates that every critical requirement has acceptance criteria, UAT roles, and existing evidence files |
| `npm run quality` | Full local release gate, including audit, coverage and browser E2E |

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

- **Backend:** Jest collects coverage on core modules listed in `jest.config.json`; CI enforces at least 80% lines/functions, 75% statements and 60% branches.
- **Frontend:** Vitest coverage via `npm run test:frontend:ci` (thresholds in `vite.config.ts`).
- Critical domain rules include application transitions, matching eligibility/capacity,
  idempotency, group capacity, notification receipt isolation, and session relationship integrity.

## Required negative and boundary cases

- Authorization: anonymous, wrong role, ownership spoofing, and stale role/session context.
- Applications: every allowed transition plus terminal-state rejection.
- Matching: pending/rejected/assigned mentees and mentors at capacity are excluded.
- Groups: nonexistent mentee, duplicate membership, full capacity, cross-group conflict, and concurrent last-seat requests.
- Sessions: nonexistent profiles and unrelated mentor–mentee pairs are rejected; assigned or same-day booked pairs succeed.
- Notifications: broadcast read state is isolated per recipient.
- Time: future dates are generated relative to the test clock; no fixed-date tests may silently expire.
- UI: happy path, empty/loading/error state, permissions, keyboard focus, dark mode, and narrow viewport.
- Performance: health/readiness p95 smoke budget is enforced in Playwright; production load tests must use production-like infrastructure.
- Dependency audit: `audit:ci` fails on moderate-or-higher vulnerabilities in runtime dependencies; development-toolchain advisories remain visible through Dependabot/CodeQL without blocking deployable runtime artifacts.
- Traceability: `docs/traceability.json` is the minimum release contract for critical requirements. Add evidence before marking a new critical workflow complete.
- Security/AI boundary: `backend/__tests__/matchingAi.test.js` verifies the provider payload remains minimized; threat and evaluation obligations are documented in `docs/THREAT_MODEL.md` and `docs/AI_EVALUATION.md`.
- Accessibility/operations evidence: use `docs/ACCESSIBILITY_AUDIT.md` for the manual WCAG pass and `docs/OPERATIONAL_DRILL_RECORD.md` for staging dependency and restore drills.

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
