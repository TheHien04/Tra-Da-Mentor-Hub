# AI evaluation contract

The deterministic matching engine is the decision layer. The optional provider is a narrative layer only. Enabling a provider must not change eligibility, ranking, access, or audit outcomes.

## Pre-release gates

| Dimension | Minimum gate | Evidence |
| --- | --- | --- |
| Privacy | Provider input contains only track, bounded lists, score, matched skills, and reason codes; no direct identifiers or free-form notes | `backend/__tests__/matchingAi.test.js` |
| Correctness | Provider output is never used to create or alter a match decision | `backend/services/matchingEngine.js`; `backend/services/matchingAi.js` |
| Reliability | Timeout is bounded by `OPENAI_TIMEOUT_MS`; non-2xx, timeout, malformed, or empty responses return deterministic fallback | `backend/services/matchingAi.js` |
| Explainability | Fallback names the score inputs and does not invent skills | `backend/services/matchingAi.js`; `backend/__tests__/matching.test.js` |
| Fairness | Compare score distributions and exclusion rates across approved cohorts before production enablement; document limitations when sample size is small | Product/Data sign-off required |
| Cost | Track request count, latency, error rate, and estimated token cost by model version without recording prompt content | Operations/Data sign-off required |

## Evaluation dataset rules

- Use synthetic or consented, redacted profiles only.
- Version fixtures and prompt/model configuration together.
- Include positive, weak-overlap, no-overlap, capacity-full, unassigned, and adversarial text cases.
- Keep human review separate from the automated score and record reviewer rationale.
- A provider outage must be an observable degraded-mode event, never a successful-looking empty response.

Fairness and cost gates require production-like telemetry and a documented cohort policy; they are not inferred from a small unit-test fixture.
