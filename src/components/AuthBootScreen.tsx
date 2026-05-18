import Skeleton from './Skeleton';

/** Shown while auth session is restored — prevents login flash on refresh */
export function AuthBootScreen() {
  return (
    <div className="auth-boot-screen" role="status" aria-live="polite" aria-busy="true">
      <Skeleton count={3} />
    </div>
  );
}

export default AuthBootScreen;
