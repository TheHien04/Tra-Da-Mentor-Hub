import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authApi } from '../services/api';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { AuthPageFooter } from '../components/AuthPageFooter';
import './AuthPage.css';

export const VerifyEmailPage = () => {
  const { t } = useAppTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage(t('pages.verifyEmail.invalidLink'));
        return;
      }

      try {
        const response = await authApi.verifyEmail(token);
        setStatus('success');
        setMessage(response.data.message || t('pages.verifyEmail.success'));
        toast.success(t('pages.verifyEmail.successToast'));

        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } } };
        setStatus('error');
        setMessage(err.response?.data?.message || t('pages.verifyEmail.failed'));
        toast.error(t('pages.verifyEmail.failedToast'));
      }
    };

    verifyEmail();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once per token
  }, [searchParams, navigate]);

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <div className="auth-card text-center">
          {status === 'loading' && (
            <>
              <div className="auth-status-icon auth-status-icon--loading" aria-label={t('common.loading')} />
              <h1 className="auth-title">{t('pages.verifyEmail.verifying')}</h1>
              <p className="auth-subtitle">{t('pages.verifyEmail.pleaseWait')}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="auth-status-icon auth-status-icon--success" aria-hidden>
                ✓
              </div>
              <h1 className="auth-title">{t('pages.verifyEmail.verifiedTitle')}</h1>
              <p className="auth-subtitle">{message}</p>
              <p className="auth-note">{t('pages.verifyEmail.redirecting')}</p>
              <div className="auth-actions">
                <Link to="/login" className="btn btn-primary w-full">
                  {t('pages.verifyEmail.goToLogin')}
                </Link>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="auth-status-icon auth-status-icon--error" aria-hidden>
                ✗
              </div>
              <h1 className="auth-title">{t('pages.verifyEmail.verificationFailed')}</h1>
              <p className="auth-subtitle">{message}</p>
              <div className="auth-actions-row">
                <Link to="/login" className="btn btn-secondary">
                  {t('auth.backToLogin')}
                </Link>
                <Link to="/register" className="btn btn-primary">
                  {t('pages.verifyEmail.resendVerification')}
                </Link>
              </div>
            </>
          )}
        </div>
        <AuthPageFooter showCopyright={false} />
      </div>
    </div>
  );
};
