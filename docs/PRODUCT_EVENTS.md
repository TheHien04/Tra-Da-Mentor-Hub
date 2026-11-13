# Product event taxonomy

The client event boundary is privacy-safe by default: it emits an in-process browser event and does not send data to a third party. A future analytics adapter must preserve this allowlist and must not add names, emails, message bodies, goals, tokens, or session notes.

| Event | When | Allowed properties | Owner |
| --- | --- | --- | --- |
| `auth.login_succeeded` | A user completes sign-in | `role` | Engineering |
| `auth.registration_succeeded` | Registration completes | `role`, `verificationRequired` | Product + Engineering |
| `auth.logout_succeeded` | Local session is cleared after logout | `role` | Engineering |
| `application.status_changed` | A valid application transition is committed | `from`, `to`, `actorRole` | Operations |
| `matching.suggestion_viewed` | An authorized operator views suggestions | `resultCount`, `filterMode` | Product + Data |
| `booking.created` | A slot booking is committed | `durationMinutes`, `source` | Product + Operations |
| `session_log.created` | A valid session log is committed | `supportFlag`, `feedbackProvided` | Product + Data |

## Governance

- Event names are immutable once used in a dashboard; introduce a new version for semantic changes.
- Properties must be bounded enums, booleans, counts, or durations unless the data owner approves otherwise.
- Every event needs an owner, source workflow, formula/interpretation, and retention policy.
- The north-star metric is computed from governed server records, not client event counts alone.
