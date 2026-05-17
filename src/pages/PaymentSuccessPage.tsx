import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { AuthPageFooter } from '../components/AuthPageFooter';
import './AuthPage.css';

export const PaymentSuccessPage = () => {
  const { t } = useAppTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown <= 0) {
      navigate('/', { replace: true });
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, navigate]);

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <div className="auth-card text-center">
          <div className="auth-status-icon auth-status-icon--success" aria-hidden>
            ✓
          </div>
          <h1 className="auth-title">{t('legal.paymentSuccess.title')}</h1>
          <p className="auth-subtitle">{t('legal.paymentSuccess.thanks')}</p>
          {sessionId && (
            <p className="auth-note text-xs break-all">
              {t('legal.paymentSuccess.sessionId')}: {sessionId}
            </p>
          )}
          <p className="auth-note">{t('legal.paymentSuccess.redirect', { count: countdown })}</p>
          <div className="auth-actions">
            <Link to="/" className="btn btn-primary w-full">
              {t('legal.paymentSuccess.goDashboard')}
            </Link>
          </div>
        </div>
        <AuthPageFooter showCopyright={false} />
      </div>
    </div>
  );
};
