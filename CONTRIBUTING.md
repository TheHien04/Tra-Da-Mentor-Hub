# Contributing to Trà Đá Mentor Hub

Thank you for improving the platform. This guide follows a standard open-source / product-engineering workflow.

## Code of conduct

Be respectful, constructive, and protect user privacy. Do not commit real user data, credentials, or production screenshots containing PII.

## Development setup

1. Fork and clone the repository.
2. `npm install`
3. `cp .env.example .env` — never commit `.env`
4. Start MongoDB locally (or use Docker: `npm run docker:up`)
5. `npm run dev:all`

See [README.md](./README.md#getting-started) for details.

## Branch strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code |
| `develop` | Integration branch (if used) |
| `feature/*` | New features |
| `fix/*` | Bug fixes |
| `docs/*` | Documentation only |

Open PRs against `main` unless coordinating a release train on `develop`.

## Pull request checklist

- [ ] Description explains **why** (not only what)
- [ ] Linked issue or ticket (if applicable)
- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] `npm run test:unit` passes (MongoDB required for auth integration tests)
- [ ] `npm run test:frontend` passes
- [ ] `npm run check:locales` passes (if i18n keys changed)
- [ ] `npm run check:secrets` passes
- [ ] No secrets, `.env`, or user uploads in the diff
- [ ] Screenshots for UI changes (attach to PR)

## Commit messages

Use clear, imperative subjects:

```
feat: add mentor export filter by track
fix: prevent double-booking of slots
docs: update OpenAPI broadcast schema
test: cover health endpoint integration
```

## Architecture changes

If your change affects system structure, security boundaries, or data persistence:

1. Update [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) if needed.
2. Add an [ADR](./docs/adr/) when the decision is non-trivial.

## API changes

- Update [`docs/openapi.json`](./docs/openapi.json)
- Verify Swagger UI at `/api/docs` after `npm run dev:server`

## Testing expectations

| Change type | Minimum tests |
|-------------|----------------|
| Bug fix | Regression test |
| API endpoint | Integration or unit test |
| Pure utility | Unit test |
| UI-only | Manual screenshot + E2E if critical path |

## Security

Report vulnerabilities privately to maintainers — do not open public issues for exploit details.

Before push:

```bash
npm run check:secrets
```

## Questions

Open a GitHub Discussion or issue with the `question` label.
