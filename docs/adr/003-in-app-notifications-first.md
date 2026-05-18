# ADR 003: In-app notifications first, optional external channels

## Status

Accepted

## Context

Admins need to reach mentors and mentees for deadlines and slot reminders. Not every deployment configures SendGrid or Zalo on day one.

## Decision

1. Every admin broadcast **always** creates an in-app notification (persisted + Socket.IO when clients are connected).
2. Email and Zalo are **optional channels** selected at send time; skipped gracefully if not configured.
3. Admin UI shows integration **status** (on/off) without exposing credentials or `.env` variable names.

Default send channel: `in_app`.

## Consequences

**Positive**

- Usable out of the box for pilots.
- No false “failure” when email is not configured but in-app succeeded.

**Negative**

- Users must open the app to see in-app notifications (no push mobile yet unless PWA).

## API

`POST /api/admin/broadcast` body includes `channel`: `in_app` | `email` | `zalo` | `email_zalo`.
