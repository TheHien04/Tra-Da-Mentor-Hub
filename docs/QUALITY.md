# Quality & SDLC maturity

This document tracks how close the repository is to a **full software engineering** bar (not only “demo complete”).

## Scorecard (target ~95–100%)

| Area | Status | Evidence |
| ---- | ------ | -------- |
| Requirements & scope | Done | README, OpenAPI, ADRs |
| Design | Done | `docs/ARCHITECTURE.md`, ADRs |
| Implementation | Done | TypeScript frontend, Express API |
| Testing | Strong | Backend core ≥80% lines/functions, Vitest, Chromium critical E2E, Firefox/WebKit contract tests and p95 smoke budget in CI |
| CI/CD | Strong | `.github/workflows/ci.yml`, `staging.yml`, `release.yml` |
| Documentation | Done | README, RUNBOOK, STAGING, TESTING, CONTRIBUTING |
| Security | Strong | SECURITY.md, production dependency audit, CodeQL SAST, Helmet, rate limits, direct SendGrid HTTPS integration |
| Release mgmt | Done | CHANGELOG, semver `1.1.0`, manual release workflow |
| Operations | Strong | RUNBOOK, liveness/readiness, admin runtime metrics, SLOs, checksum backup/guarded restore, Docker Compose |
| Governance | Done | LICENSE, PR template, issue templates, Dependabot |

## What is intentionally out of scope

- Managed staging host (wire `STAGING_DEPLOY_COMMAND` when you have a server).
- SOC2 / formal pen-test (use your org’s security process).
- Production UAT and third-party sandbox certification require real users and credentials.

## Run the full gate locally

```bash
npm run quality
```

Requires MongoDB on `27017` for integration tests.
