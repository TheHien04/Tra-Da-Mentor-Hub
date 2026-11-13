# Operational drill record

Use this record for a staging or isolated environment. Never run restore or destructive deletion drills against production.

## Readiness and dependency degradation

Run the automated contract check against a running instance with `BASE_URL=https://<staging-host> npm run test:ops`. It requires both liveness and readiness to return HTTP 200; a degraded readiness response is intentionally a failed release check.

| Drill | Command/action | Expected result | Result |
| --- | --- | --- | --- |
| Liveness | `curl -fsS "$BASE_URL/api/health"` | HTTP 200 and process health payload | `[ ] pass  [ ] fail  [ ] blocked` |
| Readiness | `curl -fsS "$BASE_URL/api/ready"` | HTTP 200 only when required production dependencies are reachable | `[ ] pass  [ ] fail  [ ] blocked` |
| Database degradation | Temporarily isolate MongoDB in staging | Readiness becomes non-ready; no success-shaped writes occur | `[ ] pass  [ ] fail  [ ] blocked` |
| Optional provider outage | Disable email/calendar/payment/AI provider in staging | Feature is labeled unavailable or falls back; no false external side effect is shown | `[ ] pass  [ ] fail  [ ] blocked` |

## Backup and restore

1. Create an encrypted backup using `npm run backup:db`.
2. Verify the authenticated sidecar before moving the archive.
3. Restore to a new isolated database using `npm run restore:db -- /exact/backup.archive.enc`.
4. Run health, authentication, authorization, and representative read checks against the restored instance.
5. Record the observed RPO/RTO and destroy only the isolated drill database.

## Evidence

- Environment:
- Build/image:
- Date/time (UTC):
- Operator:
- Backup archive checksum:
- Observed RPO:
- Observed RTO:
- Defects/incidents:
- Follow-up owner and due date:

The runbook targets remain RPO 24 hours and RTO 4 hours until production measurements justify a change.
