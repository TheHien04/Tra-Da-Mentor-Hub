# Quality & SDLC maturity

This document tracks how close the repository is to a **full software engineering** bar (not only “demo complete”).

## Scorecard (target ~95–100%)

| Area | Status | Evidence |
| ---- | ------ | -------- |
| Requirements & scope | Done | README, OpenAPI, ADRs |
| Design | Done | `docs/ARCHITECTURE.md`, ADRs |
| Implementation | Done | TypeScript frontend, Express API |
| Testing | Strong | Jest (unit + Mongo integration), Vitest, Playwright E2E in CI |
| CI/CD | Strong | `.github/workflows/ci.yml`, `staging.yml`, `release.yml` |
| Documentation | Done | README, RUNBOOK, STAGING, TESTING, CONTRIBUTING |
| Security | Done | SECURITY.md, secret checks, audit in CI, Helmet, rate limits |
| Release mgmt | Done | CHANGELOG, semver `1.1.0`, manual release workflow |
| Operations | Documented | RUNBOOK, health endpoint, Docker Compose |
| Governance | Done | LICENSE, PR template, issue templates, Dependabot |

## What is intentionally out of scope

- 80%+ line coverage on **every** file (coverage is gated on critical modules only).
- Managed staging host (wire `STAGING_DEPLOY_COMMAND` when you have a server).
- SOC2 / formal pen-test (use your org’s security process).

## Run the full gate locally

```bash
npm run quality
```

Requires MongoDB on `27017` for integration tests.
