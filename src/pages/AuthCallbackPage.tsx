import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { useAuth } from '../hooks/useAuth';
import { normalizeAuthUser } from '../lib/authUser';

export default function AuthCallbackPage() {
  const { t } = useAppTranslation();
  const { completeOAuthLogin } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const accessToken = hash.get('accessToken') || searchParams.get('accessToken');
    const refreshToken = hash.get('refreshToken') || searchParams.get('refreshToken');
    const userRaw = hash.get('user') || searchParams.get('user');
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
    }

    if (!accessToken || !refreshToken || !userRaw) {
      setError(t('auth.oauth.missingTokens'));
      return;
    }

    try {
      const user = normalizeAuthUser(JSON.parse(userRaw) as Record<string, unknown>);
      completeOAuthLogin({ user, accessToken, refreshToken });
      navigate('/', { replace: true });
    } catch {
      setError(t('auth.oauth.parseError'));
    }
  }, [searchParams, completeOAuthLogin, navigate, t]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <Link to="/login" className="btn btn-primary">
          {t('auth.login')}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 p-8">
      <div className="h-8 w-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
      <p className="text-muted">{t('auth.oauth.completing')}</p>
    </div>
  );
}
