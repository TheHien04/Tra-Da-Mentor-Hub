/** True when an unverified account must stay signed out. */
export function mustVerifyEmail(user, mailConfigured) {
  if (!user || user.emailVerified) return false;
  return Boolean(mailConfigured);
}

/** Invited addresses are already proven. Without mail delivery, new accounts stay usable. */
export function emailVerifiedOnRegister({ invited, mailConfigured }) {
  return Boolean(invited) || !mailConfigured;
}
