# Staging environment

Staging mirrors production configuration with isolated credentials and data.

## Goals

- Validate releases before `main` → production deploy
- Run E2E and smoke tests against real MongoDB
- Avoid demo auth and weak JWT placeholders

## Recommended topology

| Component | Staging | Production |
|-----------|---------|------------|
| Branch | `develop` or `release/*` | `main` |
| Database | `tra-da-mentor-staging` (Atlas) | `tra-da-mentor-prod` |
| `NODE_ENV` | `production` | `production` |
| `ENABLE_DEMO_AUTH` | `false` | `false` |
| `CORS_ORIGIN` | `https://staging.yourdomain.com` | `https://app.yourdomain.com` |
| `ENABLE_PAID_PLANS` | `false` | `false` until a reviewed post-application billing flow replaces the legacy SaaS plans |
| SendGrid | Staging API key / sandbox | Live API key |
| Stripe | Test mode keys | Live keys |

## Environment variables

Copy `.env.example` to your platform secret manager. Minimum:

```env
NODE_ENV=production
DATABASE_URL=mongodb+srv://.../tra-da-mentor-staging
JWT_SECRET=<unique-staging-secret>
JWT_REFRESH_SECRET=<unique-staging-refresh-secret>
CORS_ORIGIN=https://staging.yourdomain.com
FRONTEND_URL=https://staging.yourdomain.com
BASE_URL=https://staging.yourdomain.com
ENABLE_DEMO_AUTH=false
ENABLE_PAID_PLANS=false
```

Use **different** JWT secrets than production. Live checkout also requires both Stripe price IDs and a webhook secret; configuring a Stripe secret key alone never enables charging.

## Deploy steps

1. `npm run verify:env` with staging variables
2. `npm run build`
3. Deploy container or PaaS service (see [DEPLOY.md](../DEPLOY.md))
4. `npm run create:admin -- ...` once per environment
5. Smoke test:
   - `GET /api/health` → 200, `check: liveness`
   - `GET /api/ready` → 200, `storage: mongodb`
   - Login → dashboard
   - `GET /api/docs` → Swagger loads

## CI alignment

GitHub Actions E2E job uses `NODE_ENV=test` with MongoDB — not identical to staging but catches regressions.

Optional: add a `staging` deployment workflow on push to `develop` (Railway/Render preview).

## Promotion to production

1. All CI checks green on PR
2. Staging smoke checklist signed off
3. Merge to `main`
4. Production deploy with production secrets (never reuse staging JWT)
