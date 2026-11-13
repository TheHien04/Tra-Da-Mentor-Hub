# User acceptance test matrix

This matrix turns the product operating model into executable UAT scenarios. QA owns evidence capture; Product/BA owns expected outcomes and sign-off; Engineering owns defect correction.

| ID | Role | Scenario | Expected result | Evidence |
| --- | --- | --- | --- | --- |
| UAT-AUTH-01 | Mentee | Register from a valid invite, sign in, refresh, then sign out | The account is created, the session remains authenticated after refresh, and sign-out prevents further protected access | `backend/__tests__/auth.test.js`; `e2e/production-flows.spec.ts` |
| UAT-APP-01 | Admin | Move an application through invite, interview, and accept | Each transition succeeds only in order and appears in the audit history | `backend/__tests__/applicationLifecycle.test.js` |
| UAT-MATCH-01 | Admin | Generate matching suggestions with one unassigned and one at-capacity mentor | Only eligible records appear and every suggestion has a reason | `backend/__tests__/matching.test.js` |
| UAT-BOOK-01 | Admin | Book an open slot, then retry the same request | One booking is created; the retry returns the same result and does not double-book | `backend/__tests__/stores.test.js`; `backend/__tests__/sessionHardening.test.js` |
| UAT-SESSION-01 | Mentor | Create a log for an assigned mentee, then try an unrelated mentee | The valid log is saved; the unrelated relationship is rejected with a clear error | `backend/__tests__/api.crm.test.js`; `e2e/production-flows.spec.ts` |
| UAT-DATA-01 | Mentee | Export account data and request deletion | Export is scoped to the requester; deletion is authorized, auditable, and cannot mutate the demo account | `backend/__tests__/sessionHardening.test.js`; `e2e/critical-paths.spec.ts` |

## Sign-off rules

- Product/BA signs off the expected business outcome.
- QA records environment, build/version, actor role, test data identifier, timestamp, result, and defect ID if failed.
- Security must review any failed authorization, privacy, audit, or deletion scenario before release.
- A blocked environment (for example unavailable MongoDB) is recorded as **blocked**, not as a product pass.

The machine-checked source of truth is [`docs/traceability.json`](./traceability.json).
