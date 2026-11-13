# Accessibility audit evidence

This is the current web accessibility evidence baseline. It is not a substitute for a manual VoiceOver/NVDA pass with real assistive technology.

## Automated coverage

| Area | Expected outcome | Evidence |
| --- | --- | --- |
| Page structure | Critical authenticated pages expose one primary heading | `e2e/ux-hardening.spec.ts` |
| Keyboard interaction | Command menu keeps focus inside its dialog and controls have accessible names | `e2e/critical-paths.spec.ts` |
| Touch target sizing | Primary buttons and mobile navigation controls are at least 44 CSS pixels high | `e2e/ux-hardening.spec.ts` |
| Responsive layout | Dashboard has no horizontal overflow at 390px viewport width | `e2e/ux-hardening.spec.ts` |
| Theme support | Dark mode is announced by the toggle name and persists after reload | `e2e/ux-hardening.spec.ts` |
| Reduced motion | Non-essential animation and transition durations are reduced when the user requests it | `e2e/ux-hardening.spec.ts` |
| Focus visibility | The first keyboard-focused control remains visible inside the viewport with a focus indicator | `e2e/ux-hardening.spec.ts` |
| Form semantics | Critical flows use labels and role-based selectors rather than positional selectors | `e2e/production-flows.spec.ts` |

## Manual release checklist

Run on one supported desktop browser with VoiceOver (macOS) and one Chromium-based browser with keyboard-only navigation:

- [ ] Focus order follows the visual order and focus is never hidden behind sticky UI.
- [ ] Every icon-only control has an accessible name; decorative icons are hidden from the accessibility tree.
- [ ] Validation errors are associated with fields and the first invalid field receives focus.
- [ ] Color is not the only signal for status, required fields, errors, or support flags.
- [ ] Text remains readable at 200% zoom and with browser text size increased.
- [ ] `prefers-reduced-motion: reduce` disables non-essential motion.
- [ ] Dialogs announce their name, role, and close action.
- [ ] Authentication supports password managers and paste.

Record browser/OS, build identifier, date, tester, and defects in the release evidence. A failed manual item is a release defect or an explicitly accepted accessibility risk; it is not silently treated as a pass.
