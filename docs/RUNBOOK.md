# Operations runbook

On-call and operator procedures for Trà Đá Mentor Hub.

## Service URLs

| Environment | Liveness | Readiness | API docs |
|-------------|----------|-----------|----------|
| Local | http://localhost:5000/api/health | http://localhost:5000/api/ready | http://localhost:5000/api/docs |
| Production | `https://<host>/api/health` | `https://<host>/api/ready` | `https://<host>/api/docs` |

## Health check

**Liveness:** `GET /api/health` — the process is serving HTTP.

**Readiness:** `GET /api/ready` — production dependencies are available and the instance may receive traffic.

| `status` | Meaning | Action |
|----------|---------|--------|
| `ok` | Serving traffic | None |
| `degraded` | MongoDB down in production | Fix database connectivity, restart app |

```bash
curl -sS https://<host>/api/health | jq .
curl -sS https://<host>/api/ready | jq .
BASE_URL=https://<host> npm run test:ops
```

## Common incidents

### MongoDB connection failure

**Symptoms:** 503 on `/api/ready`, logs: `MongoDB is required in production`

1. Verify `DATABASE_URL` in platform secrets
2. Check Atlas IP allowlist / VPC peering
3. Confirm cluster is not paused
4. Restart application after DB is reachable

### JWT / auth errors spike

1. Confirm `JWT_SECRET` unchanged mid-deploy (invalidates tokens)
2. Check server clock skew (NTP)
3. Verify `CORS_ORIGIN` matches frontend URL

### Emails not sending

1. Admin → Notifications shows Email **Off** → expected without SendGrid
2. Set `SENDGRID_API_KEY` and `SENDGRID_FROM_EMAIL` on server
3. Restart process; check SendGrid activity dashboard

### Avatars missing after deploy

1. Ensure volume mounted at `backend/uploads`
2. Docker: `uploads_data` volume in `docker-compose.yml`

## Deploy procedure

1. `npm run check:secrets` (from clean checkout)
2. `npm run verify:env`
3. `npm run build`
4. Deploy artifact / image
5. Post-deploy: health + login smoke test

## Rollback

1. Revert to previous platform release / image tag
2. Database migrations are forward-only — do not restore Mongo snapshot without coordination
3. Verify `/api/health` and `/api/ready`

## Backups (MongoDB Atlas)

- Enable continuous backup on production cluster
- Create a protected key file outside the repository (`openssl rand -hex 32 > /secure/path/tra-da-mentor-backup.key`, mode `600`)
- Run `DATABASE_URL=... BACKUP_ENCRYPTION_KEY_FILE=/secure/path/tra-da-mentor-backup.key npm run backup:db`
- Verify the generated authenticated HMAC sidecar before moving the archive; restore refuses missing or mismatched MACs
- Test restore quarterly to an isolated staging database with
  `DATABASE_URL=... BACKUP_ENCRYPTION_KEY_FILE=/secure/path/tra-da-mentor-backup.key RESTORE_CONFIRM=restore npm run restore:db -- /exact/backup.archive.enc`
- Never run restore against production during a drill
- Target RPO: 24 hours; target RTO: 4 hours until the hosting provider offers stricter guarantees

## Monitoring

| Signal | Source |
|--------|--------|
| Errors | Sentry (`SENTRY_DSN`, `VITE_SENTRY_DSN`) |
| Logs | Platform log drain (Railway/Render/Docker) |
| Process uptime | External ping on `/api/health` |
| Traffic readiness | Load balancer probe on `/api/ready` |
| Runtime saturation | Authenticated admin `GET /api/admin/metrics` (request count, latency, 5xx, memory) |

### Initial service-level objectives

- Availability: 99.5% successful readiness checks per calendar month
- API latency: p95 below 750 ms for health/readiness and below 1.5 s for authenticated reads
- Error budget: fewer than 1% HTTP 5xx responses over 30 minutes
- Alert when readiness fails twice consecutively, 5xx exceeds 1%, or memory grows continuously for 15 minutes
- Review SLOs after the first 30 days of real production traffic; do not tighten them without measurements

## Security incidents

1. Rotate `JWT_SECRET` / `JWT_REFRESH_SECRET` (forces re-login)
2. Rotate compromised third-party keys (SendGrid, Stripe, Google)
3. Revoke active invites: admin → Invite Users
4. Review access logs for suspicious admin actions

## Contacts

- Engineering: repository maintainers (GitHub Issues)
- Escalation: program owner / Trà Đá Community
