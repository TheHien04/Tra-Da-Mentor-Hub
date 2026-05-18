# ADR 001: MongoDB required in production

## Status

Accepted

## Context

Early development used in-memory Maps when MongoDB was unavailable. That allowed fast local demos but caused data loss on restart and divergent behavior from production.

## Decision

When `NODE_ENV=production`:

1. `connectDatabase()` failure → process exits (no silent fallback).
2. `/api/health` returns **503 degraded** if Mongo is not connected.
3. Invite tokens and other durable data persist only in MongoDB.

Development may still fall back to memory stores with a logged warning.

## Consequences

**Positive**

- Predictable production behavior.
- Clear operator signal via health check.

**Negative**

- Local dev requires Mongo (Docker or Atlas) for full parity.
- CI integration tests need a MongoDB service container.

## Compliance

Enforced in `backend/server.js`, `backend/lib/healthStatus.js`, and CI E2E job.
