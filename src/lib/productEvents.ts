export const PRODUCT_EVENT_NAMES = {
  loginSucceeded: 'auth.login_succeeded',
  registrationSucceeded: 'auth.registration_succeeded',
  logoutSucceeded: 'auth.logout_succeeded',
} as const;

type ProductEventName = (typeof PRODUCT_EVENT_NAMES)[keyof typeof PRODUCT_EVENT_NAMES];

type ProductEventProperties = {
  role?: 'admin' | 'mentor' | 'mentee' | 'user';
  verificationRequired?: boolean;
};

export function trackProductEvent(
  name: ProductEventName,
  properties: ProductEventProperties = {}
): void {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent('tradamentor:product-event', {
      detail: {
        name,
        properties,
        occurredAt: new Date().toISOString(),
      },
    })
  );
}
