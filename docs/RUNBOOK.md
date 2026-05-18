# Operations runbook

On-call and operator procedures for Trà Đá Mentor Hub.

## Service URLs

| Environment | Health | API docs |
|-------------|--------|----------|
| Local | http://localhost:5000/api/health | http://localhost:5000/api/docs |
| Production | `https://<host>/api/health` | `https://<host>/api/docs` |

## Health check

**Endpoint:** `GET /api/health`

| `status` | Meaning | Action |
|----------|---------|--------|
| `ok` | Serving traffic | None |
| `degraded` | MongoDB down in production | Fix database connectivity, restart app |

```bash
curl -sS https://<host>/api/health | jq .
```

## Common incidents

### MongoDB connection failure

**Symptoms:** 503 on `/api/health`, logs: `MongoDB is required in production`

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
3. Verify `/api/health`

## Backups (MongoDB Atlas)

- Enable continuous backup on production cluster
- Test restore quarterly to a staging cluster
- Document RPO/RTO with program stakeholders

## Monitoring

| Signal | Source |
|--------|--------|
| Errors | Sentry (`SENTRY_DSN`, `VITE_SENTRY_DSN`) |
| Logs | Platform log drain (Railway/Render/Docker) |
| Uptime | External ping on `/api/health` |

## Security incidents

1. Rotate `JWT_SECRET` / `JWT_REFRESH_SECRET` (forces re-login)
2. Rotate compromised third-party keys (SendGrid, Stripe, Google)
3. Revoke active invites: admin → Invite Users
4. Review access logs for suspicious admin actions

## Contacts

- Engineering: repository maintainers (GitHub Issues)
- Escalation: program owner / Trà Đá Community
