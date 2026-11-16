# Quality & SDLC maturity

This document tracks how close the repository is to a **full software engineering** bar (not only “demo complete”).

## Evidence-based scorecard

| Area | Status | Evidence |
| ---- | ------ | -------- |
| Requirements & scope | Documented | README, OpenAPI, ADRs; validate against pilot users |
| Design | Documented | `docs/ARCHITECTURE.md`, ADRs; accessibility review pending |
| Implementation | Built | TypeScript frontend, Express API |
| Testing | Strong | Backend core ≥80% lines/functions, Vitest, Chromium critical E2E, Firefox/WebKit contract tests and p95 smoke budget in CI |
| CI/CD | Conditional | CI gate exists; staging requires a configured deploy command and live readiness verification |
| Documentation | Maintained | README, RUNBOOK, STAGING, TESTING, CONTRIBUTING, production gate checklist |
| Security | Strong | SECURITY.md, production dependency audit, CodeQL SAST, Helmet, rate limits, direct SendGrid HTTPS integration |
| Release mgmt | Built | CHANGELOG, semver `1.1.0`, manual release workflow; promotion evidence pending |
| Operations | Conditional | RUNBOOK, liveness/readiness, admin runtime metrics, SLO targets, HMAC-protected backup/guarded restore; live alerts and restore drill remain unverified |
| Governance | Built | LICENSE, PR template, issue templates, Dependabot |

## What is intentionally out of scope

- Managed staging host (configure `STAGING_DEPLOY_COMMAND` and `STAGING_URL`; the workflow fails if either is missing).
- SOC2 / formal pen-test (use your org’s security process).
- Production UAT and third-party sandbox certification require real users and credentials.

## Run the full gate locally

```bash
npm run quality
```

Requires MongoDB on `27017` for integration tests.
