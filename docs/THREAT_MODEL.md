# Threat model

This is the minimum threat model for the current single-service deployment: Express API, React SPA, Socket.IO, MongoDB, and optional external providers.

## Trust boundaries

| Boundary | Assets crossing it | Required controls |
| --- | --- | --- |
| Browser ↔ API | Session cookies, CSRF header, user input | HttpOnly/SameSite cookies, CSRF validation, TLS, input validation, rate limits |
| API ↔ MongoDB | Identity, profiles, applications, sessions, audit data | Least-privilege connection, server-side authorization, sanitized operators, backups protected like production data |
| API ↔ Socket.IO clients | Notifications and presence events | Authenticated connection, recipient scoping, payload minimization, disconnect cleanup |
| API ↔ providers | Payment, email, calendar, AI requests | Explicit feature flags, timeouts, secret manager, no unnecessary PII, failure fallback without false success |
| Admin ↔ operational tools | Exports, audit logs, runtime metrics | Admin RBAC, audit trail, export masking, separate operational credentials |

## Abuse cases and mitigations

| ID | Threat | Impact | Current mitigation | Verification |
| --- | --- | --- | --- | --- |
| SEC-01 | Credential stuffing or session theft | Account takeover | Auth rate limit, refresh rotation, HttpOnly cookies, CSRF for cookie mutations | `backend/__tests__/sessionHardening.test.js`; `backend/__tests__/auth.test.js` |
| SEC-02 | Broken object-level authorization | Cross-user data access or mutation | Ownership and role guards use authenticated identity, not body IDs | `backend/__tests__/api.access.test.js`; `backend/__tests__/accessGuards.test.js` |
| SEC-03 | NoSQL/operator injection | Query bypass or data corruption | Mongo sanitization and schema/input validation | `backend/__tests__/security.test.js`; `backend/middleware/security.js` |
| SEC-04 | PII leakage through logs or AI | Privacy and compliance exposure | Log redaction policy, AI field minimization, provider timeout and fallback | `backend/__tests__/matchingAi.test.js`; `docs/DATA_GOVERNANCE.md` |
| SEC-05 | Duplicate or replayed writes | Double booking or inconsistent workflow | Idempotency keys, resource locks, terminal state rules | `backend/__tests__/sessionHardening.test.js`; `backend/__tests__/applicationLifecycle.test.js` |
| SEC-06 | Malicious upload or oversized request | Storage abuse or service degradation | Byte/type validation and request body limit | `backend/__tests__/accessGuards.test.js`; `backend/middleware/security.js` |
| SEC-07 | Dependency or client-side compromise | Remote code execution or data theft | Runtime audit, CSP, lockfile, CodeQL/Dependabot in CI | `npm run audit:ci`; `SECURITY.md` |

## Residual risks before production

- DAST and an authorized penetration test are still required; automated tests do not prove absence of exploitable paths.
- Upload storage needs a production quota, malware/content scanning decision, and lifecycle policy.
- Provider webhook signatures and replay handling need verification for each enabled integration.
- Secret rotation and backup restore must be exercised in staging with production-like access controls.

Any new endpoint must add its asset, actor, abuse case, authorization test, and operational fallback to this document before release.
