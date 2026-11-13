/** Routes that use the compact public/authentication header instead of app navigation. */
const PUBLIC_SHELL_PATHS = new Set([
  '/login',
  '/register',
  '/verify-email',
  '/forgot-password',
  '/reset-password',
  '/programs',
  '/pricing',
  '/payment/success',
  '/auth/callback',
  '/privacy-policy',
  '/terms-of-service',
  '/unauthorized',
]);

export function usesPublicShell(pathname: string) {
  return PUBLIC_SHELL_PATHS.has(pathname);
}
