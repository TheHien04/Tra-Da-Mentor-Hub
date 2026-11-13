# Data governance and metric contract

## Principles

- Collect the minimum data required to operate mentorship.
- Derive decisions from named source fields and documented formulas.
- Never mix demo seed data with production reporting.
- Treat missing data as unknown, not zero or success.
- Keep product telemetry free of message bodies, tokens, passwords, and unnecessary personal data.
- Treat third-party AI calls as a separate processor boundary with explicit minimization and timeout controls.

## Data classes

| Class | Examples | Handling |
| --- | --- | --- |
| Public | program descriptions, published testimonials | Cacheable; editorial review required |
| Internal | capacity, groups, aggregate analytics | Authenticated; role-limited |
| Personal | names, email, phone, school, goals | Least privilege; export/delete workflow required |
| Sensitive operational | support flags, session notes, audit history | Strict role/ownership checks; never emit to client analytics |
| Secrets | tokens, passwords, API keys | Environment/secret manager only; redact from logs |

## Metric dictionary

| Metric | Formula | Source | Caveat |
| --- | --- | --- | --- |
| Application stage count | count of mentees by current `applicationStatus` | mentee profiles | Snapshot, not cohort-based |
| Interview rate | applications that reached `interviewed` / all applications | current status + application history | Legacy accepted records without history are treated as interviewed |
| Acceptance rate | `accepted` / (`accepted` + `rejected`) | mentee profiles | Excludes undecided applications |
| Completion rate | progress = 100 / all mentees | mentee profiles | Progress definition must be consistent by cohort |
| Mentor utilization | mean assigned mentees / mentor capacity | mentor profiles | Does not measure mentor time or quality |
| Sessions logged | session logs within selected period | session logs | Not equivalent to attended sessions unless attendance is captured |
| Satisfaction | mean available mentor and mentee scores | session logs | Always show sample size before comparative use |
| Needs support | logs with either support flag | session logs | A flag count is not a resolved-case count |

## Application event contract

The authoritative event is the append-only item in `applicationHistory`:

```text
from, to, changedAt, actorId, actorRole, reason
```

Required quality checks:

- `from` and `to` are valid states and conform to the application state machine.
- `changedAt` is server-generated.
- `actorId` and `actorRole` come from authenticated identity, never request-supplied identity.
- reasons are optional, plain text, and limited to 500 characters.
- concurrent transitions cannot both succeed from the same previous state.

## Ownership and access

| Dataset | Owner | Readers | Writers |
| --- | --- | --- | --- |
| User identity | Platform admin | self, authorized admin | auth service/admin workflow |
| Mentor/mentee profile | Program operations | role/ownership policy | owner or admin by field policy |
| Application history | Program operations | authorized mentors/admin | application transition service |
| Session records | Program operations | involved roles/admin | authorized session workflow |
| Audit log | Security/operations | admin | server middleware only |

## Retention and deletion

Before production launch, the product owner must approve jurisdiction-appropriate retention periods. Until then:

- exports are explicit administrator actions and are audit logged;
- logs must not contain tokens, passwords, or full request bodies with sensitive fields;
- account/profile deletion must cascade or anonymize references according to an approved policy;
- backups need the same retention and access controls as primary data;
- deletion requests need an auditable completion record without retaining the deleted personal payload.

## Reporting quality gate

Do not publish a decision dashboard unless its numerator, denominator, time window, timezone, data freshness, and treatment of missing values are defined. Cohort comparisons additionally require cohort identifiers and immutable cohort membership.

## Data quality contract

Every operational dataset must have a validator or a documented query that checks:

- required identifiers are present and unique within their domain;
- timestamps are server-generated, timezone-normalized, and not in the future beyond an explicit clock-skew tolerance;
- references point to existing records and respect the relationship/ownership invariant;
- enum values follow the domain state machine;
- counts distinguish unknown, missing, demo, and zero;
- deletion/export jobs report scope, outcome, and completion time without retaining deleted personal payloads.

The release evidence for these checks belongs in the relevant backend integration test and UAT record. A dashboard is not considered data-quality complete merely because it renders.

## AI provider boundary

The matching engine is the authoritative decision layer. Optional AI output is narrative-only and must never change eligibility, ranking, or access decisions.

- Send only track, bounded expertise/interests, match score, matched skills, and reason codes.
- Do not send names, email addresses, phone numbers, session notes, support flags, tokens, or free-form goals.
- Use a bounded provider timeout and fall back to the deterministic explanation when the provider is unavailable.
- Review provider retention, regional processing, and deletion terms before enabling the integration in production.

