# ADR 002: JWT access tokens with refresh tokens and RBAC

## Status

Accepted

## Context

The platform serves browser clients and needs stateless API scaling with role-based feature access (admin, mentor, mentee).

## Decision

- **Access token** (JWT, short-lived via `JWT_EXPIRE`) sent as `Authorization: Bearer`.
- **Refresh token** stored server-side on the user document; rotated on refresh endpoint.
- **RBAC** enforced in route middleware (`authorize('admin')`) and frontend `ProtectedRoute`.
- Public allowlist in `requireApiAuth.js` for health, auth, invite validation, payment webhooks, and API docs.

## Consequences

**Positive**

- Horizontally scalable API tier.
- Explicit public vs protected surface.

**Negative**

- Token revocation requires refresh token invalidation (logout clears server-side list).
- Admin registration requires invite token (see invite store).

## Security requirements

- `JWT_SECRET` and `JWT_REFRESH_SECRET` must differ and be ≥ 64 random bytes.
- `ENABLE_DEMO_AUTH` must be `false` in production.
