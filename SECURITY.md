# Security Policy

## Supported versions

| Version | Supported |
| ------- | --------- |
| 1.1.x   | Yes       |
| 1.0.x   | Best effort |
| < 1.0   | No        |

## Reporting a vulnerability

**Do not open a public GitHub issue for security-sensitive bugs.**

1. Email the maintainers with a clear description, steps to reproduce, and impact.
2. Allow up to **7 business days** for an initial response.
3. We will coordinate disclosure and a fix release when appropriate.

## Secure development practices in this repo

- JWT secrets validated at startup (`backend/lib/secretValidation.js`).
- Rate limiting and Helmet on the API (`backend/middleware/security.js`).
- `npm run check:secrets` in CI blocks tracked `.env` files.
- Production requires MongoDB (`DATABASE_URL`); demo auth is disabled unless explicitly enabled.
- Dependency audit runs in CI (`npm audit --audit-level=high`).

## Deployment reminders

- Rotate `JWT_SECRET` and `JWT_REFRESH_SECRET` if leaked.
- Never commit `.env`, API keys, or user uploads from `backend/uploads/`.
- Use HTTPS and restrict `CORS_ORIGIN` to your frontend origin in production.
