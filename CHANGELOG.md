# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- OpenAPI 3 specification and Swagger UI at `/api/docs`
- Architecture documentation and ADRs (`docs/ARCHITECTURE.md`, `docs/adr/`)
- Expanded Jest suite (all `backend/__tests__`, coverage gate in CI)
- `createApp()` factory for integration testing
- `CONTRIBUTING.md`, `docs/STAGING.md`, `docs/RUNBOOK.md`
- Production admin bootstrap: `npm run create:admin`
- Invite persistence (MongoDB), register-via-invite flow
- Admin notification channels UI (in-app first; optional email/Zalo)
- E2E specs: smoke, critical paths, production flows
- CI: locale parity, frontend unit tests, npm audit, MongoDB for integration tests

### Changed

- README rewritten (professional English, SDLC sections, screenshots)
- Production requires MongoDB (no silent memory fallback)
- Notification admin page: service status without exposing env keys

### Security

- `check:secrets` script and CI enforcement
- `verify:env` production validation script
- Docker volume for `backend/uploads`

## [1.0.0] - 2026-05-16

### Added

- Initial production-oriented release: mentor/mentee CRM, scheduling, session logs, analytics, i18n, Stripe/Google integrations (optional).

[Unreleased]: https://github.com/TheHien04/Tra-Da-Mentor-Hub/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/TheHien04/Tra-Da-Mentor-Hub/releases/tag/v1.0.0
