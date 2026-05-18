# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2026-05-16

### Added

- OpenAPI 3 specification and Swagger UI at `/api/docs`
- Architecture documentation and ADRs (`docs/ARCHITECTURE.md`, `docs/adr/`)
- CRM + admin Mongo integration tests (`api.crm.test.js`, `api.admin.test.js`)
- `createApp()` factory for integration testing
- `CONTRIBUTING.md`, `docs/STAGING.md`, `docs/RUNBOOK.md`, `docs/TESTING.md`, `docs/QUALITY.md`
- Production admin bootstrap: `npm run create:admin`
- Invite persistence (MongoDB), register-via-invite flow
- Admin notification channels UI (in-app first; optional email/Zalo)
- E2E specs: smoke, critical paths, production flows
- CI: locale parity, frontend coverage, npm audit (fail on high), MongoDB for integration tests
- GitHub: PR/issue templates, Dependabot, SECURITY.md, staging + release workflows
- `npm run quality` local quality gate

### Changed

- README rewritten (professional English, SDLC sections, screenshots)
- Production requires MongoDB (no silent memory fallback)
- Notification admin page: service status without exposing env keys
- Package version `1.1.0`

### Security

- `check:secrets` script and CI enforcement
- `verify:env` production validation script
- Docker volume for `backend/uploads`

## [1.0.0] - 2026-05-16

### Added

- Initial production-oriented release: mentor/mentee CRM, scheduling, session logs, analytics, i18n, Stripe/Google integrations (optional).

[Unreleased]: https://github.com/TheHien04/Tra-Da-Mentor-Hub/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/TheHien04/Tra-Da-Mentor-Hub/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/TheHien04/Tra-Da-Mentor-Hub/releases/tag/v1.0.0
