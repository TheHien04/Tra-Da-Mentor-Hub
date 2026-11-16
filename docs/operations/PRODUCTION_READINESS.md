# Production readiness

This checklist is a release decision record, not a claim that every integration is live. Complete it for each staging and production environment. See [STAGING](../STAGING.md), [RUNBOOK](../RUNBOOK.md), and [TESTING](../TESTING.md).

## Implemented in the repository

- React application and Express API with role and ownership checks, CSRF protection, validation, rate limits, audit history, and MongoDB persistence in production.
- Mentor/mentee/group lifecycle, applications, availability and booking, session logs, analytics, and admin workflows.
- Development-only demo account and simulated integrations; production rejects demo authentication and requires MongoDB.
- CI checks build, lint, contracts, unit/integration tests, and browser journeys. `npm run quality` mirrors the local gate when MongoDB is available.
- Health and readiness endpoints, runtime metrics, runbook, guarded encrypted backup/restore scripts, and CodeQL workflow.

Implemented code is not evidence that a third-party service or production environment has been configured and verified.

## Release gates

| Gate | Evidence required before launch | Status |
| --- | --- | --- |
| Hosting | Staging and production URL, owner, rollback command, and deployment history recorded | Pending environment setup |
| Secrets | Unique strong JWT secrets, database credentials, `ENABLE_DEMO_AUTH=false`, `npm run verify:env` passes | Pending environment verification |
| Database | Managed MongoDB authentication, access controls, indexes, backup schedule, and a timed restore drill | Pending environment verification |
| Staging deploy | `.github/workflows/staging.yml` deploys and `/api/ready` reports `status=ok`, `storage=mongodb` | Pending host configuration |
| Email and Google | Sandbox and live credentials, authorized domains, OAuth callback, verification/reset and calendar flows tested | Pending provider verification |
| Payments | Keep `ENABLE_PAID_PLANS=false` until product/billing policy is approved, then verify Stripe test/live webhooks and refunds | Disabled by default |
| Security | Threat model, OWASP ASVS review, dependency and secret scan, authorized penetration test, remediation sign-off | Pending independent verification |
| Accessibility | Keyboard and screen-reader journeys, WCAG 2.2 AA audit, light/dark/mobile checks | Pending full audit |
| Product | Real cohort UAT, support process, pricing/consent review, analytics definitions and owners | Pending pilot evidence |
| Operations | Alerts, on-call owner, SLO measurement, incident/rollback drill, retention and privacy requests | Pending environment verification |

## Go/no-go

Release to a controlled pilot only when the relevant gates above have owners and evidence. Broad public launch requires all applicable gates to pass in the actual deployment. Record exceptions with an owner, expiry date, and rollback plan.

Do not use old cost estimates or local demo screenshots as proof of production performance, provider readiness, or security. Recheck current vendor prices and terms when selecting infrastructure.
