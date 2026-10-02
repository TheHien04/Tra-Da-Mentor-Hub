import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { useAuth } from '../hooks/useAuth';

export default function AuthCallbackPage() {
  const { t } = useAppTranslation();
  const { restoreSession } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (window.location.hash || window.location.search.includes('accessToken')) {
      window.history.replaceState(null, '', window.location.pathname);
    }
    void restoreSession()
      .then(() => navigate('/', { replace: true }))
      .catch(() => setError(t('auth.oauth.parseError')));
  }, [restoreSession, navigate, t]);

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
    </div>
  );
}
