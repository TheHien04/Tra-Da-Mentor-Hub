import { describe, expect, it, vi } from 'vitest';
import { PRODUCT_EVENT_NAMES, trackProductEvent } from '../productEvents';

describe('product event boundary', () => {
  it('emits only approved, non-PII properties', () => {
    const dispatchEvent = vi.fn();
    vi.stubGlobal('window', { dispatchEvent });
    vi.stubGlobal(
      'CustomEvent',
      class {
        type: string;
        detail: unknown;

        constructor(type: string, init: { detail: unknown }) {
          this.type = type;
          this.detail = init.detail;
        }
      }
    );

    trackProductEvent(PRODUCT_EVENT_NAMES.loginSucceeded, { role: 'mentee' });

    expect(dispatchEvent).toHaveBeenCalledOnce();
    expect(dispatchEvent.mock.calls[0][0].detail).toEqual(
      expect.objectContaining({
        name: 'auth.login_succeeded',
        properties: { role: 'mentee' },
      })
    );
    vi.unstubAllGlobals();
  });
});
