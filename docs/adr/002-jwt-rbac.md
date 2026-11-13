# ADR 002: JWT access tokens with refresh tokens and RBAC

## Status

Accepted

## Context

The platform serves browser clients and needs stateless API scaling with role-based feature access (admin, mentor, mentee).

## Decision

- **Access token** (JWT, short-lived via `JWT_EXPIRE`) is stored in a secure `httpOnly` cookie for browser clients. Bearer tokens remain supported for API tooling.
- **Refresh token** is stored in a secure `httpOnly` cookie; only its hash and metadata are stored on the user document, and it is rotated atomically on refresh.
- **CSRF protection** requires a matching readable CSRF cookie and `X-CSRF-Token` header for cookie-authenticated mutations.
- **RBAC** enforced in route middleware (`authorize('admin')`) and frontend `ProtectedRoute`.
- Public allowlist in `requireApiAuth.js` for health, auth, invite validation, payment webhooks, and API docs.

## Consequences

**Positive**

- Horizontally scalable API tier.
- Explicit public vs protected surface.

**Negative**

- Token revocation requires refresh-token invalidation (logout clears the matching server-side hash).
- Admin registration requires invite token (see invite store).

## Security requirements

- `JWT_SECRET` and `JWT_REFRESH_SECRET` must differ and be ≥ 64 random bytes.
- `ENABLE_DEMO_AUTH` must be `false` in production.
- Authentication cookies must use `Secure` in production and an appropriate `SameSite` policy.
